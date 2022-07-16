/* Imports */
const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    /* Varibles */
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress

    /* Select parameters in different enviriment */
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

    log("Read images from files ")
    const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" })
    const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" })

    const deployArgs = [ethUsdPriceFeedAddress, lowSVG, highSVG]

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

module.exports.tags = ["all", "dynamicSvgNft", "main"]
