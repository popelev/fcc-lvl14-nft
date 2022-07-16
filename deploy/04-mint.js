/* Imports */
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()
    // basic
    const basicNft = await ethers.getContract("BasicNft", deployer)
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    const basicUri = await basicNft.tokenURI(1)
    console.log("Basic NFT index 1 has token uri: " + basicUri)

    //dynamic
    const highValue = ethers.utils.parseEther("4000")
    const dynamicNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicMintTx = await dynamicNft.mintNft(highValue.toString())
    await dynamicMintTx.wait(1)
    const dynamicUri = await dynamicNft.tokenURI(1)
    console.log("Dynamic Svg NFT index 1 has token uri: " + dynamicUri)

    //random
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const randomMintFee = await randomIpfsNft.getMintFee()
    await new Promise(async (resolve) => {
        setTimeout(resolve, 300000) //5min
        randomIpfsNft.once("NftMinted", async function () {
            resolve()
        })
        const randomMintTx = await randomIpfsNft.mintNft({ value: randomMintFee.toString() })
        const randomMintTxReceipt = await randomMintTx.wait(1)
        if (developmentChains.includes(network.name)) {
            const requestId = randomMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
    const randomUri = await randomIpfsNft.tokenURI(1)
    console.log("Random NFT index 1 has token uri: " + randomUri)
}
module.exports.tags = ["all", "mint"]
