# Jetable Network

![](https://i.imgur.com/WlbUyUq.jpg)

## Overview

Jetable is revolutionizing blockchain accessibility by empowering everyday users with professional-level capabilities. We are building a DApp store that features:
- Low-Code On-Chain Triggers
- Integrating both on-chain data and off-chain APIs (including AI-powered functions)
- RPC Triggers

## What Jetable can do in a nutshell?
- Empower **average users** with **degen** (pro users) capabilities through low-code and AI-generated triggers
- Boost **DApps** growth hacking by lowering user **adoption barriers** via RPC triggers


## AI-Powered Low-Code On-Chain Triggers (2C)
Jetable provides a unified framework for both on-chain interactions and off-chain API integrations, allowing users to create their own workflows using intuitive low-code drag-and-drop features. Onchain Trigger keeps an eye on the mempool of Ethereum or compatible chains to detect unconfirmed transactions. When specific characteristics are identified, Onchain Trigger can instantly execute user-defined transactions tailored to unique user requirements.

Simultaneously, Jetable supports third-party off-chain APIs to enhance on-chain triggers. Users can harness the power of 0x API, CEX API, and OpenAI API to create a diverse range of use cases, which can then be shared or sold.

### Use Cases
- **ENS Squatting**: How can you secure your desired ENS domains from others?
- **TWAP Selling**: How can average users execute TWAP sells with minimal market impact?
- **Pool Sniping**: Ape in fast as a degen
- **DCA Buying**: Simplify the dollar-cost averaging process


### Technical Architecture
The front-end of Jetable is built using the Vue framework and interacts with the blockchain network through the Ethers.js library to initiate and query user-defined transactions. Onchain Trigger can be fully decentralized and implemented with a low-code design, offering efficient, user-friendly, and rapid transaction execution capabilities.
![](https://i.imgur.com/dFOAvlp.png)


The Ethereum mempool, is a section of the blockchain memory that holds all transactions awaiting confirmation and packaging by miners. It serves as a temporary storage area where transactions are broadcasted to the network when a user initiates a transaction, and then stored in the mempool to be processed by validators. Transactions within the mempool are sorted based on factors such as transaction fees and priority, enabling more suitable transaction fees to be applied. Jetable's Onchain Trigger can make user-defined transactions execute faster or slower by adjusting the appropriate transaction fees within the mempool.

![](https://i.imgur.com/4BSlL57.png)


### Our Goal
By monitoring memory pool transactions, every action on the chain can be precisely detected, and the extensive callable modules enable users to implement various on-chain and off-chain pipelines with greater flexibility. Onchain Trigger aids users in achieving truly autonomous triggering within the Web3 operating system.

### ENS Squatting Demo

[ENS Squatting Demo](https://onchain-trigger.jetable.xyz/)

![](https://i.imgur.com/eXCZCqA.jpg)

1. **Domain List Input**:
Integrate OpenAI API to generate a list of crypto slang terms and project/company names.

2. **Availability and Redemption Check**:
Determine if the domain is available or in the redemption period.

3. **Price and Mempool Monitoring**:
Check if the price has fallen below the bid price or if anyone is attempting to register the domain.

4. **Registration or Front-running**:
Secure the ENS domain by registering it (if it's unregistered) or by front-running others' registration transactions.



## RPC Triggers (2B)

While public RPC offers numerous benefits such as permissionless and decentralized access, we can expand its functionalities even further through RPC triggers.

### Use Cases
- **Gasless**: Eliminating Web2 Users' First Gas Barrier
- **"Slow Delivery" Transaction**: Delayed Tx for Greater Savings
- **MEV Protection**: Say No to Sandwich Attacks
- **Referral**

### Gasless Demo

[Gasless NFT Mint Demo](https://jetable.xyz/)

Jetable presents the first-ever wallet-agnostic gasless solution by implementing it at the deeper RPC layer. In contrast, other wallet-specific solutions lack cross-compatibility.

![](https://i.imgur.com/qBeq5Bm.png)

Native assets like ETH, BNB, and LAT (ofc) can be barriers to mainstream blockchain adoption. However, DApps can sponsor gas fees as a growth hacking technique to onboard new users more efficiently.

![](https://i.imgur.com/eCJXIHL.png)

With Jetable, traditional Web2 users can dive into the Web3 world without worrying about gas fees or delays, ensuring a smooth onboarding experience regardless of the wallet being used (EOA / Smart Contract).

### Technical Architecture
Jetable RPC Trigger is an RPC-triggered solution designed to offer automated transaction packaging services for blockchain transactions. This product filters user transactions through custom rules created on an open platform with no-code capabilities. If a transaction meets the specified conditions, Jetable RPC Trigger can execute various transaction logics.

![](https://i.imgur.com/eb4o5qg.png)
1. Automatically subsidizing transaction fees: Jetable can automatically subsidize transactions, ensuring that even fully Web 2.0 "3zero" users (0 balance, 0 knowledge, 0 experience) can easily interact with smart contracts.
2. Differentiating subsidy recipients: Jetable RPC Trigger can help sponsors differentiate subsidy recipients based on specific transaction properties or even Web 2.0 rules, ensuring that sponsorship funds are allocated appropriately.
3. Preventing MEV Attacks: Jetable RPC Trigger can help users automatically protect against MEV attacks based on their own set rules (such as transactions exceeding a certain limit), improving the fairness and transparency of transactions.

![](https://i.imgur.com/lPyb0s0.png)



### Future Goals
- **Multi-chain Support**: Gain an edge with non-EVM blockchain compatibility
- **DApps Onboarding**: Seamlessly integrate RPC triggers for a diverse range of applications
- **Regularly Updated Triggers**: Monthly additions tailored to market needs and trends
- **Open DApp Store**: Encourage third-party developer contributions
- **Decentralized Network**: Implement proprietary tokenomics for a more robust ecosystem

## Team
- CEO: [Kay Fong](https://twitter.com/keyahayek), Venture Partner @ [NGC Ventures](https://ngc.fund/team), PlatON & Alaya Genesis Validator
- CTO: [Dave Lee](https://twitter.com/LeePerfect233), Ex-Architect @ Microsoft
- CEEO (Chief EverythingElse Officer): [ChatGPT](https://chat.openai.com/chat)
