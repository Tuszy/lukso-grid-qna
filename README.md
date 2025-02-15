# Lukso Grid - Incentivized Q&A

# Demo Video
[Youtube - Incentivized Q&A - Lukso - Hack the Grid - Level 1](https://www.youtube.com/watch?v=Ym1YeURd-aw)

# Diagram
<img src="diagram.png" />

# Description
This project's goal is to create a fully decentralized Q&A grid widget, that allows the hosting universal profiles to receive a compensation for answering questions of their visitors. In other words, the visitor offers a custom defined amount of LYX to the host for answering a question. The host only receives the reward if he answers the question. Otherwise the visitor will be allowed to revoke the question and receive the offered LYX back, of course as long as it has not been answered yet. The purpose of this widget is to allow creators/stars dedicate their precious time to fans without having to cut back on income. Furthermore each "Q&A" pair is represented by a LSP8 token (NFT2.0) which can be treated as a type of autograph or certificate of authenticity.


# Tech
Every host UP needs to setup the Q&A grid widget by deploying a LSP8 based "QuestionAndAnswer" by using the "QuestionAndAnswerFactory" singleton. The latter not only creates the "QuestionAndAnswer" contract for the host UP, but also stores a mapping for all created contracts (host up => contract address). This way duplication is prevented in a simple way and we have single source of truth, when it comes to verification. Of course this setup is hidden behind the Q&A grid widget ui, so that the host does not need any technical knowledge. The grid widget automatically detects the host on connection, because it compares the "context account" with the "provider account". Depending on this state the ui changes from "visitor" to "manager" and vice versa. It allows the host UP to not only deploy the Q&A contract, but also to adapt the minimum reward he expects to receive for an answered question and furthermore he can style the widget to some extent (e.g. colors and greeting/introduction text). The style configuration is saved in the UPs ERC725Y storage (mapping key: "QuestionAndAnswer:Config"), so that it can easily be fetched together with the "LSP3Profile" using the ERC725 toolset.
Every "Q&A" pair is represented by a LSP8 Token. The token id is the keccak256 hash of the question, to prevent duplicates. Asking a question mints a LSP8Token and writes the question content to the "Question" key of the token and the sent value (= reward) is stored under the "Reward" key of the token. The sent value must be greater/equal than the specified minimum reward, otherwise the mint fails. As long as a question is not answered by the owner (=host UP), it can be revoked by the questioner. Revoking a question burns the LSP8 token and sends the associated value back to the questioner. If a question gets answered, its "answered" state is set to true and the host UP receives the associated value. From now on the question cannot be revoked anymore. The answer is store under the "Answer" key of the token. The "QuestionAndAnswer" contract has a full test suite. Every smart contract call is done through the grid widget ui. The routing is controlled by the current "context account" and "provider account". The host UP answers through it and the visitor UP asks through it. 

# Related links

- [QuestionAndAnswerFactory](https://explorer.execution.mainnet.lukso.network/address/0xe1dA84dF8b3700CD406738E72AB0fbAf559b474F?tab=contract) (Verified smart contract that makes it easy to setup Q&A grid widgets)
- [Q&A Universal Profile](https://universaleverything.io/0x32FF6D42aEC22dE731d88A155a140b89FF269E94) (Showcase of 'Incentivized Question & Answer' grid widget)
- [https://lukso-grid-qna.tuszy.com](https://lukso-grid-qna.tuszy.com) (Link for adding it manually to your grid)
