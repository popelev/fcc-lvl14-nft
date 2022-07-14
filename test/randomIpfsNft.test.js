const { expect, assert } = require("chai")
const { network, deployments, ethers, getNamedAccounts, getChainId } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")

!developmentChains.includes(network.name)
    ? describe.skip //("features", function () {})
    : describe("RandomIpfsNft. Unit", async function () {
          let randomIpfsNft, randomIpfsNftUser1, emptyContract
          let accounts
          let deployerAddress, user1Address
          const chainId = network.config.chainId

          beforeEach(async function () {
              /* deployer */
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployerAddress = (await getNamedAccounts()).deployer
              user1Address = (await getNamedAccounts()).user1
              await deployments.fixture(["all"])
              randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployerAddress)
              randomIpfsNftUser1 = await ethers.getContract("RandomIpfsNft", user1Address)
              emptyContract = await ethers.getContract("EmptyContract", deployerAddress)
          })

          describe("constructor", async function () {
              it("Initialize the random ipfs nft correctly", async function () {
                  const vrfCoordinator = await randomIpfsNft.getVrfCoordinatorAddress()
                  const mintFee = await randomIpfsNft.getMintFee()
                  expect(vrfCoordinator.toString() !== "0x0000000000000000000000000000000000000000")
                  expect(mintFee).to.be.above(0)
              })
          })

          describe("requestNft", async function () {
              it("requestNft failed if not enough ETH", async function () {
                  await expect(randomIpfsNft.requestNft({ value: 1 })).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreETHSent"
                  )
              })
              it("requestNft and emit NftRequested", async function () {
                  const mintFee = await randomIpfsNft.getMintFee()
                  await expect(randomIpfsNft.requestNft({ value: mintFee }))
                      .to.emit(randomIpfsNft, "NftRequested")
                      .withArgs(anyValue, deployerAddress)
              })
          })

          xdescribe("random", async function () {
              it("requestNft and emit NftMinted", async function () {
                  const mintFee = await randomIpfsNft.getMintFee()
                  await expect(randomIpfsNft.requestNft({ value: mintFee })).to.emit(
                      randomIpfsNft,
                      "NftMinted"
                  )
              })
          })

          describe("withdraw", async function () {
              it("withdraw posible if not owner", async function () {
                  assert(await randomIpfsNft.withdraw(deployerAddress))
              })
              it("withdraw not posible if not owner", async function () {
                  await expect(
                      randomIpfsNftUser1.withdraw(emptyContract.address)
                  ).to.be.revertedWith("Ownable: caller is not the owner")
              })
              it("withdraw transaction failed", async function () {
                  await expect(randomIpfsNft.withdraw(emptyContract.address)).to.be.revertedWith(
                      "RandomIpfsNft__TransferFaild"
                  )
              })
          })

          describe("getters", async function () {
              it("getBreedFromModdedRng", async function () {
                  const getter = await randomIpfsNft.getBreedFromModdedRng(1)
                  expect(getter).to.be.least(0)
              })
              it("getBreedFromModdedRng failed if moddedRng > max chance", async function () {
                  const maxChance = await randomIpfsNft.getMaxChance()
                  const moddedRng = maxChance + 1
                  await expect(randomIpfsNft.getBreedFromModdedRng(moddedRng)).to.be.revertedWith(
                      "RandomIpfsNft__RangeOutOfBounds"
                  )
              })
              it("getGasLane", async function () {
                  const getter = await randomIpfsNft.getGasLane()
                  assert(getter.toString() !== "")
              })
              it("getDogTokenUris", async function () {
                  const getter = await randomIpfsNft.getDogTokenUris(0)
                  expect(getter).to.have.lengthOf.above(0)
              })
              xit("getTokenCounter", async function () {
                  const getter = await randomIpfsNft.getTokenCounter()
                  expect(getter).to.be.least(0)
              })
          })
      })
