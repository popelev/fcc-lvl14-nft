const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 LINK per request
const GAS_PRICE_LINK = 1e9
const DECIMALS = "18"
const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("local network detected! deploying mocks...")
        log("----------------------------------------------------------")

        const VRF_deployArgs = [BASE_FEE, GAS_PRICE_LINK]
        log("VRF_deployArgs " + VRF_deployArgs)
        await deploy("VRFCoordinatorV2Mock", {
            contract: "VRFCoordinatorV2Mock",
            from: deployer,
            log: true,
            args: VRF_deployArgs,
        })
        log("VRFCoordinatorV2Mock deployed!")
        log("----------------------------------------------------------")

        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("MockV3Aggregator deployed!")
        log("----------------------------------------------------------")

        await deploy("EmptyContract", {
            contract: "EmptyContract",
            from: deployer,
            log: true,
            args: "",
        })
        log("EmptyContract deployed!")
        log("----------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
