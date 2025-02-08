// SPDX-License-Identifier: Apache 2.0
pragma solidity ^0.8.20;

// OpenZeppelin
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// Lukso
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {_INTERFACEID_LSP0} from "@lukso/lsp0-contracts/contracts/LSP0Constants.sol";
import {LSP8Enumerable} from "@lukso/lsp8-contracts/contracts/extensions/LSP8Enumerable.sol";
import {LSP8IdentifiableDigitalAsset} from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import {LSP8NotTokenOperator} from "@lukso/lsp8-contracts/contracts/LSP8Errors.sol";
import {_LSP8_TOKENID_FORMAT_HASH, _LSP8_TOKEN_METADATA_BASE_URI, _LSP8_TOKEN_METADATA_BASE_URI} from "@lukso/lsp8-contracts/contracts/LSP8Constants.sol";
import {_LSP4_METADATA_KEY, _LSP4_CREATORS_ARRAY_KEY, _LSP4_CREATORS_MAP_KEY_PREFIX, _LSP4_TOKEN_TYPE_KEY, _LSP4_TOKEN_TYPE_NFT} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

// Local
import {IQuestionAndAnswer} from "./IQuestionAndAnswer.sol";
import {QuestionHasAlreadyBeenAnswered, QuestionHasAlreadyBeenAsked, MinRewardHasNotChanged, ValueMustBeGreaterThanOrEqualMinReward, MustNotSetQuestionKeyManually, MustNotSetAnswerKeyManually, MustNotSetRewardKeyManually, MustNotSetAskTimestampKeyManually, MustNotSetAnswerTimestampKeyManually, MustNotSetAskerKeyManually, TransferringOwnershipIsNotAllowed, OwnerMustNotBeAnEOA, OwnerMustNotBeAsker} from "./QuestionAndAnswerError.sol";
import {_INTERFACEID_QUESTION_AND_ANSWER, _QUESTION_KEY, _ANSWER_KEY, _REWARD_KEY, _ASKER_KEY, _ASK_TIMESTAMP_KEY, _ANSWER_TIMESTAMP_KEY} from "./QuestionAndAnswerConstants.sol";

/**
 * @title Question and Answer NFT Implementation.
 * This contract allows users to ask questions in an incentivized way by offering the owner a reward if the asked question gets answered.
 * Every question is represented by a LSP8 token. These tokens are burnable as long as the question has not been answered.
 * Once the question has been answered, the owner receives the reward and the LSP8 token becomes "complete".
 * If an "incomplete" LSP8 token is burnt by the questioner, he receives his offered reward back.
 * @author Dennis Tuszynski
 * @dev Contract module represents an implementation of the QuestionAndAnswer interface IQuestionAndAnswer.
 */
contract QuestionAndAnswer is IQuestionAndAnswer, LSP8Enumerable {
    /**
     * @inheritdoc IQuestionAndAnswer
     */
    uint256 public minReward;

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    mapping(bytes32 => bool) public answered;

    /**
     * @notice Constructs a Q&A thread
     * @param metadataUrl_ The url pointing to the metadata json.
     * @param owner_ The address of the Q&A owner.
     * @param minReward_ Minimum reward expected to be able to ask a question. (mint price with open end)
     */
    constructor(
        address owner_,
        bytes memory metadataUrl_,
        uint256 minReward_
    )
        LSP8IdentifiableDigitalAsset(
            "Question & Answer",
            "QnA",
            owner_,
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_HASH
        )
    {
        if (
            !ERC165Checker.supportsERC165InterfaceUnchecked(
                owner_,
                _INTERFACEID_LSP0
            )
        ) {
            revert OwnerMustNotBeAnEOA(owner_);
        }
        minReward = minReward_;
        _setData(_LSP4_METADATA_KEY, metadataUrl_);
        _setData(
            _LSP8_TOKEN_METADATA_BASE_URI,
            bytes.concat(
                hex"00008019f9b10000",
                unicode"https://lukso-grid-qna-baseuri.tuszy.com/",
                bytes(Strings.toHexString(uint256(uint160(address(this))), 20)),
                unicode"/"
            )
        );

        _setData(_LSP4_CREATORS_ARRAY_KEY, bytes.concat(bytes16(uint128(1))));
        _setData(
            bytes32(
                bytes.concat(
                    bytes16(_LSP4_CREATORS_ARRAY_KEY),
                    bytes16(uint128(0))
                )
            ),
            bytes.concat(bytes20(owner_))
        );
        _setData(
            bytes32(
                bytes.concat(
                    _LSP4_CREATORS_MAP_KEY_PREFIX,
                    bytes2(0),
                    bytes20(owner_)
                )
            ),
            bytes.concat(_INTERFACEID_LSP0, bytes16(uint128(0)))
        );
    }

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    function ask(
        bytes32 questionId,
        bytes memory questionUrl
    ) public payable virtual override {
        if (_msgSender() == owner()) {
            revert OwnerMustNotBeAsker(_msgSender());
        }
        if (_exists(questionId)) {
            revert QuestionHasAlreadyBeenAsked(questionId);
        }

        uint256 reward = msg.value;
        if (reward < minReward) {
            revert ValueMustBeGreaterThanOrEqualMinReward(minReward, reward);
        }

        super._setDataForTokenId(
            questionId,
            _ASKER_KEY,
            bytes.concat(bytes20(_msgSender()))
        );
        super._setDataForTokenId(
            questionId,
            _ASK_TIMESTAMP_KEY,
            bytes.concat(bytes32(block.timestamp))
        );
        super._setDataForTokenId(questionId, _QUESTION_KEY, questionUrl);
        super._setDataForTokenId(questionId, _ANSWER_KEY, "");
        super._setDataForTokenId(
            questionId,
            _REWARD_KEY,
            bytes.concat(bytes32(reward))
        );

        answered[questionId] = false;

        _mint(_msgSender(), questionId, false, "");

        emit QuestionAsked(_msgSender(), questionId, reward);
    }

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    function answer(
        bytes32 questionId,
        bytes memory answerUrl
    ) public virtual override onlyOwner {
        if (answered[questionId]) {
            revert QuestionHasAlreadyBeenAnswered(questionId);
        }

        answered[questionId] = true;

        uint256 reward = getReward(questionId);
        uint256 availableBalance = address(this).balance;
        assert(reward <= availableBalance);

        super._setDataForTokenId(
            questionId,
            _ANSWER_TIMESTAMP_KEY,
            bytes.concat(bytes32(block.timestamp))
        );
        super._setDataForTokenId(questionId, _ANSWER_KEY, answerUrl);

        (bool success, ) = owner().call{value: reward}("");
        assert(success);

        emit QuestionAnswered(tokenOwnerOf(questionId), questionId, reward);
    }

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    function revoke(bytes32 questionId) public virtual override {
        if (!_isOperatorOrOwner(_msgSender(), questionId)) {
            revert LSP8NotTokenOperator(questionId, _msgSender());
        }

        if (answered[questionId]) {
            revert QuestionHasAlreadyBeenAnswered(questionId);
        }

        uint256 reward = getReward(questionId);
        uint256 availableBalance = address(this).balance;
        assert(reward <= availableBalance);

        super._setDataForTokenId(questionId, _QUESTION_KEY, "");
        super._setDataForTokenId(questionId, _ANSWER_KEY, "");
        super._setDataForTokenId(questionId, _REWARD_KEY, "");
        super._setDataForTokenId(questionId, _ASKER_KEY, "");
        super._setDataForTokenId(questionId, _ASK_TIMESTAMP_KEY, "");
        super._setDataForTokenId(questionId, _ANSWER_TIMESTAMP_KEY, "");
        delete answered[questionId];

        address questioner = tokenOwnerOf(questionId);

        _burn(questionId, "");

        (bool success, ) = questioner.call{value: reward}("");
        assert(success);

        emit QuestionRevoked(questioner, questionId, reward);
    }

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    function setMinReward(
        uint256 newMinReward
    ) public virtual override onlyOwner {
        if (minReward == newMinReward) revert MinRewardHasNotChanged(minReward);

        uint256 oldMinReward = minReward;
        minReward = newMinReward;
        emit MinRewardChanged(oldMinReward, newMinReward);
    }

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    function getAsker(
        bytes32 questionId
    ) public view virtual override returns (address) {
        _existsOrError(questionId);
        return address(bytes20(getDataForTokenId(questionId, _ASKER_KEY)));
    }

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    function getAskTimestamp(
        bytes32 questionId
    ) public view virtual override returns (uint256) {
        _existsOrError(questionId);
        return
            uint256(bytes32(getDataForTokenId(questionId, _ASK_TIMESTAMP_KEY)));
    }

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    function getAnswerTimestamp(
        bytes32 questionId
    ) public view virtual override returns (uint256) {
        _existsOrError(questionId);
        return
            uint256(
                bytes32(getDataForTokenId(questionId, _ANSWER_TIMESTAMP_KEY))
            );
    }

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    function getReward(
        bytes32 questionId
    ) public view virtual override returns (uint256) {
        _existsOrError(questionId);
        return uint256(bytes32(getDataForTokenId(questionId, _REWARD_KEY)));
    }

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    function getAnswer(
        bytes32 questionId
    ) public view virtual override returns (bytes memory) {
        _existsOrError(questionId);
        return getDataForTokenId(questionId, _ANSWER_KEY);
    }

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    function getQuestion(
        bytes32 questionId
    ) public view virtual override returns (bytes memory) {
        _existsOrError(questionId);
        return getDataForTokenId(questionId, _QUESTION_KEY);
    }

    /**
     * @inheritdoc IQuestionAndAnswer
     */
    function getQuestionAndAnswer(
        bytes32 questionId
    )
        public
        view
        virtual
        override
        returns (
            address asker,
            uint256 reward,
            uint256 askTimestamp,
            uint256 answerTimestamp,
            bytes memory q,
            bytes memory a,
            bool isAnswered
        )
    {
        _existsOrError(questionId);
        asker = address(bytes20(getDataForTokenId(questionId, _ASKER_KEY)));
        reward = uint256(bytes32(getDataForTokenId(questionId, _REWARD_KEY)));
        askTimestamp = uint256(
            bytes32(getDataForTokenId(questionId, _ASK_TIMESTAMP_KEY))
        );
        answerTimestamp = uint256(
            bytes32(getDataForTokenId(questionId, _ANSWER_TIMESTAMP_KEY))
        );
        q = getDataForTokenId(questionId, _QUESTION_KEY);
        a = getDataForTokenId(questionId, _ANSWER_KEY);
        isAnswered = answered[questionId];
    }

    /**
     * @inheritdoc LSP8IdentifiableDigitalAsset
     */
    function _setDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override(LSP8IdentifiableDigitalAsset) {
        if (dataKey == _QUESTION_KEY) {
            revert MustNotSetQuestionKeyManually();
        } else if (dataKey == _ANSWER_KEY) {
            revert MustNotSetAnswerKeyManually();
        } else if (dataKey == _REWARD_KEY) {
            revert MustNotSetRewardKeyManually();
        } else if (dataKey == _ASKER_KEY) {
            revert MustNotSetAskerKeyManually();
        } else if (dataKey == _ASK_TIMESTAMP_KEY) {
            revert MustNotSetAskTimestampKeyManually();
        } else if (dataKey == _ANSWER_TIMESTAMP_KEY) {
            revert MustNotSetAnswerTimestampKeyManually();
        }
        super._setDataForTokenId(tokenId, dataKey, dataValue);
    }

    /**
     * @inheritdoc LSP8IdentifiableDigitalAsset
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data // solhint-disable-next-line no-empty-blocks
    ) internal virtual override {
        if (to == owner()) {
            revert OwnerMustNotBeAsker(to);
        } else if (
            !ERC165Checker.supportsERC165InterfaceUnchecked(
                to,
                _INTERFACEID_LSP0
            ) && to != address(0)
        ) {
            revert OwnerMustNotBeAnEOA(to);
        }
        super._beforeTokenTransfer(from, to, tokenId, force, data);
    }

    /**
     * @inheritdoc Ownable
     */
    function renounceOwnership() public virtual override(Ownable) onlyOwner {
        revert TransferringOwnershipIsNotAllowed();
    }

    /**
     * @inheritdoc Ownable
     */
    function transferOwnership(
        address
    ) public virtual override(Ownable) onlyOwner {
        revert TransferringOwnershipIsNotAllowed();
    }

    /**
     * @inheritdoc LSP8IdentifiableDigitalAsset
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(LSP8IdentifiableDigitalAsset)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_QUESTION_AND_ANSWER ||
            super.supportsInterface(interfaceId);
    }
}
