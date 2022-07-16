/* Imports */
const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const deployArgs = []
    log(" " + deployArgs)
    /* Deply contract */
    log("Deploy  contract")
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: deployArgs,
        log: true,
        waitConformations: network.config.blockConfirmations || 1,
    })

    /* Verify contract */
    log("Contract deployed!")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(basicNft.address, deployArgs)
    }
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "basicNft", "main"]
