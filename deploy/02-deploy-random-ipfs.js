/* Imports */
const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("100")
const imagesLocation = "./images/randomNft"

const UPLOAD_TO_PINATA = process.env.UPLOAD_TO_PINATA

const metadataTemplate = {
    name: "",
    desctription: "",
    image: "",
    attributes: [
        {
            train_type: "Cuteness",
            value: 100,
        },
    ],
}

module.exports = async ({ getNamedAccounts, deployments }) => {
    //Varibles
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorAddress
    let subscriptionId = 0

    // IPFS images
    let tokensUris = [
        "ipfs://QmUXGaHr4qqTdqUR1QvAPv9HRvRBufx48daeB2SqBU4rnD",
        "ipfs://QmcJCxPTuJQEkPivv12cPPBUEcWJ15VRy3JMe7oqCekr4f",
        "ipfs://QmbcwpoQwgE9idFpXon2ZbypwCG4UCRYWQscSByKfwXqtu",
    ]
    if (UPLOAD_TO_PINATA == "true") {
        tokensUris = await handleTokenUris()
    }

    //Deploy start
    if (developmentChains.includes(network.name)) {
        log("Read VRFCoordinatorV2Mock from local testnet ")
        const vrgCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorAddress = vrgCoordinatorV2Mock.address
        log("Create Subscription for Mock in local testnet")
        const txResponse = await vrgCoordinatorV2Mock.createSubscription()
        const txReceipt = await txResponse.wait()
        subscriptionId = txReceipt.events[0].args.subId
        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrgCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        log("Read VRFCoordinatorV2Mock from mainnet or real testnet")
        vrfCoordinatorAddress = await networkConfig[chainId]["VRFCoordinatorV2Mock"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")
    const deployArgs = [
        vrfCoordinatorAddress,
        subscriptionId,
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["callbackGasLimit"],
        tokensUris,
        networkConfig[chainId]["mintFee"],
    ]
    log("VRFCoordinatorV2Args " + deployArgs)

    /* Deply contract */
    log("Deploy randomipfs contract")
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: deployArgs,
        log: true,
        waitConformations: waitBlockConfirmations,
    })

    /* Verify contract */
    log("Contract deployed!")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(raffle.address, deployArgs)
    }
    log("----------------------------------------------------------")
}

async function handleTokenUris() {
    let tokensUris = []
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)

    for (imageUploadResponsesIndex in imageUploadResponses) {
        const ipfsLinkHeader = "ipfs://"
        let tokensUriMetadata = { ...metadataTemplate }
        tokensUriMetadata.name = files[imageUploadResponsesIndex].replace(".png", "")
        tokensUriMetadata.desctription = "An adorable " + tokensUriMetadata.name + " pup!"
        tokensUriMetadata.image =
            ipfsLinkHeader + imageUploadResponses[imageUploadResponsesIndex].IpfsHash
        console.log("uploading " + tokensUriMetadata.name)
        const matadataUploadResponse = await storeTokenUriMetadata(tokensUriMetadata)
        const linkWithHash = ipfsLinkHeader + matadataUploadResponse.IpfsHash
        tokensUris.push(linkWithHash)
    }
    console.log("Token URIs Uploaded! They are:")
    console.log(tokensUris)

    return tokensUris
}

module.exports.tags = ["all", "randomipfs", "main"]
