const { expect, assert } = require("chai")
const { network, deployments, ethers, getNamedAccounts, getChainId } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip //("features", function () {})
    : describe("RandomIpfsNft. Unit", async function () {
          let randomIpfsNft
          let accounts
          let deployerAddress, user1Address
          const chainId = network.config.chainId

          beforeEach(async function () {
              /* deployer */
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployerAddress = (await getNamedAccounts()).deployer
              user1Address = (await getNamedAccounts()).user1
              await deployments.fixture(["all"])
              randomIpfsNft = await ethers.getContract("BasicNft", deployerAddress)
          })

          describe("constructor", async function () {
              it("Initialize the random ipfs nft correctly", async function () {})
          })
      })
