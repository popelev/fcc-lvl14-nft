const { expect, assert } = require("chai")
const { network, deployments, ethers, getNamedAccounts, getChainId } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip //("features", function () {})
    : describe("BasicNft. Unit", async function () {
          let basicNft
          let accounts
          let deployerAddress
          const chainId = network.config.chainId

          beforeEach(async function () {
              /* deployer */
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployerAddress = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              basicNft = await ethers.getContract("BasicNft", deployerAddress)
          })

          describe("constructor", async function () {
              it("Initialize the BasicNft correctly", async function () {
                  const name = await basicNft.name()
                  const symbol = await basicNft.symbol()
                  assert.equal(name, "Dogie")
                  assert.equal(symbol, "DOG")
              })
          })

          describe("mintNft", async function () {
              it("Increase token counter after mint", async function () {
                  const tokenCounterBefore = await basicNft.getTokenCounter()
                  const tokenCounterAfter = await basicNft.mintNft()
                  assert.equal(tokenCounterBefore.toNumber() + 1, tokenCounterAfter)
              })
              it("Increase token counter after mint", async function () {
                  const tokenCounterBefore = await basicNft.getTokenCounter()
                  await basicNft.mintNft()
                  const tokenCounterAfter = await basicNft.getTokenCounter()
                  assert.equal(tokenCounterBefore.toNumber() + 1, tokenCounterAfter)
              })
          })
      })
