const { expect, assert } = require("chai")
const { network, deployments, ethers, getNamedAccounts, getChainId } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip //("features", function () {})
    : describe("BasicNft. Unit", async function () {
          let basicNft, basicNftUser1
          let accounts
          let deployerAddress, user1Address
          const chainId = network.config.chainId

          beforeEach(async function () {
              /* deployer */
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployerAddress = (await getNamedAccounts()).deployer
              user1Address = (await getNamedAccounts()).user1
              await deployments.fixture(["all"])
              basicNft = await ethers.getContract("BasicNft", deployerAddress)
              basicNftUser1 = await ethers.getContract("BasicNft", user1Address)
          })

          describe("constructor", async function () {
              it("Initialize the BasicNft correctly", async function () {
                  const name = await basicNft.name()
                  const symbol = await basicNft.symbol()
                  assert.equal(name, "Dogie")
                  assert.equal(symbol, "DOG")
              })
          })

          describe("mint nft", async function () {
              it("Increase token counter after mint", async function () {
                  const tokenCounterBefore = await basicNft.getTokenCounter()
                  assert.equal(tokenCounterBefore.toNumber(), 0)

                  await basicNft.mintNft()
                  const tokenCounterAfter = await basicNft.getTokenCounter()
                  assert.equal(tokenCounterAfter.toNumber(), 1)
              })
              it("deployer is owner of nft", async function () {
                  await basicNft.mintNft()
                  const tokenCounter = await basicNft.getTokenCounter()
                  const owner = await basicNft.ownerOf(tokenCounter)
                  assert.equal(owner, deployerAddress)
              })
              it("Increase balance of tokens of owner ", async function () {
                  const balanceBefore = await basicNft.balanceOf(deployerAddress)
                  assert.equal(balanceBefore.toNumber(), 0)

                  await basicNft.mintNft()
                  const balanceAfter = await basicNft.balanceOf(deployerAddress)
                  assert.equal(balanceAfter.toNumber(), 1)
              })
          })

          describe("transfer", async function () {
              it("nft transfered from owner to user1 by owner", async function () {
                  await basicNft.mintNft()
                  const tokenCounter = await basicNft.getTokenCounter()
                  let owner = await basicNft.ownerOf(tokenCounter)
                  assert.equal(owner, deployerAddress)

                  await basicNft["safeTransferFrom(address,address,uint256)"](
                      deployerAddress,
                      user1Address,
                      tokenCounter
                  )

                  owner = await basicNft.ownerOf(tokenCounter)
                  assert.equal(owner, user1Address)
              })

              it("nft transfered from owner to user1 by user1 after owner approve", async function () {
                  await basicNft.mintNft()
                  const tokenCounter = await basicNft.getTokenCounter()
                  let owner = await basicNft.ownerOf(tokenCounter)
                  assert.equal(owner, deployerAddress)

                  await basicNft.approve(user1Address, tokenCounter)

                  await basicNftUser1["safeTransferFrom(address,address,uint256)"](
                      deployerAddress,
                      user1Address,
                      tokenCounter
                  )
                  owner = await basicNft.ownerOf(tokenCounter)
                  assert.equal(owner, user1Address)
              })
              it("not allowed to transfer nft from owner to user1 by user1 if owner does not approve", async function () {
                  await basicNft.mintNft()
                  const tokenCounter = await basicNft.getTokenCounter()
                  let owner = await basicNft.ownerOf(tokenCounter)
                  assert.equal(owner, deployerAddress)

                  await expect(
                      basicNftUser1["safeTransferFrom(address,address,uint256)"](
                          deployerAddress,
                          user1Address,
                          tokenCounter
                      )
                  ).to.be.revertedWith("ERC721: caller is not token owner nor approved")
              })

              it("owner give approve for all nft for user1", async function () {
                  await basicNft.mintNft()
                  await basicNft.mintNft()
                  await basicNft.mintNft()
                  await basicNft.setApprovalForAll(user1Address, true)
                  assert(basicNftUser1.isApprovedForAll(deployerAddress, user1Address))
              })
              it("owner does not give approve for all nft for user1", async function () {
                  await basicNft.mintNft()
                  await basicNft.mintNft()
                  await basicNft.mintNft()
                  expect(
                      await basicNftUser1.isApprovedForAll(deployerAddress, user1Address)
                  ).to.equal(false)
              })
          })
      })
