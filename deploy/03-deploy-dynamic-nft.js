/* Imports */
const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const PRICE_FEED_ADDRESS = process.env.PRICE_FEED_ADDRESS

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        log("Read MockV3Aggregator from local testnet ")
        const mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = mockV3Aggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const deployArgs = [PRICE_FEED_ADDRESS, "", ""]
    log(" " + deployArgs)
    /* Deply contract */
    log("Deploy  contract")
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: deployArgs,
        log: true,
        waitConformations: waitBlockConfirmations,
    })

    /* Verify contract */
    log("Contract deployed!")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(dynamicSvgNft.address, deployArgs)
    }
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "dynamicSvgNft"]
