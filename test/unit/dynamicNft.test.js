const { expect, assert } = require("chai")
const { network, deployments, ethers, getNamedAccounts, getChainId } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip //("features", function () {})
    : describe("DynamicSvgNft. Unit", async function () {
          let dynamicSvgNft, dynamicSvgNftUser1
          let accounts
          let deployerAddress, user1Address
          const chainId = network.config.chainId

          beforeEach(async function () {
              /* deployer */
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployerAddress = (await getNamedAccounts()).deployer
              user1Address = (await getNamedAccounts()).user1
              await deployments.fixture(["all"])
              dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployerAddress)
              dynamicSvgNftUser1 = await ethers.getContract("DynamicSvgNft", user1Address)
          })

          describe("constructor", async function () {
              it("Initialize the dynamicSvgNft correctly", async function () {
                  const name = await dynamicSvgNft.name()
                  const symbol = await dynamicSvgNft.symbol()
                  assert.equal(name, "Dynamic SVG NFT")
                  assert.equal(symbol, "DSN")
              })
          })

          describe("mint nft", async function () {
              it("Increase token counter after mint", async function () {
                  const tokenCounterBefore = await dynamicSvgNft.getTokenCounter()
                  assert.equal(tokenCounterBefore.toNumber(), 0)

                  await dynamicSvgNft.mintNft(1)
                  const tokenCounterAfter = await dynamicSvgNft.getTokenCounter()
                  assert.equal(tokenCounterAfter.toNumber(), 1)
              })
              it("deployer is owner of nft", async function () {
                  await dynamicSvgNft.mintNft(1)
                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  const owner = await dynamicSvgNft.ownerOf(tokenCounter)
                  assert.equal(owner, deployerAddress)
              })
              it("Increase balance of tokens of owner ", async function () {
                  const balanceBefore = await dynamicSvgNft.balanceOf(deployerAddress)
                  assert.equal(balanceBefore.toNumber(), 0)

                  await dynamicSvgNft.mintNft(1)
                  const balanceAfter = await dynamicSvgNft.balanceOf(deployerAddress)
                  assert.equal(balanceAfter.toNumber(), 1)
              })
          })

          describe("token uri", async function () {
              it("low price uri", async function () {
                  const priceFeed = (await dynamicSvgNft.getLastPrice()).add(10)
                  await dynamicSvgNft.mintNft(priceFeed)
                  const tokenId = await dynamicSvgNft.getTokenCounter()
                  const tokenUri = await dynamicSvgNft.SelectUri(tokenId)
                  const lowTokenUri = await dynamicSvgNft.getLowImageURI()
                  assert(tokenUri.includes(lowTokenUri))
              })
              it("high price uri", async function () {
                  const priceFeed = (await dynamicSvgNft.getLastPrice()).add(-10)
                  await dynamicSvgNft.mintNft(priceFeed)
                  const tokenId = await dynamicSvgNft.getTokenCounter()
                  const tokenUri = await dynamicSvgNft.SelectUri(tokenId)
                  const highTokenUri = await dynamicSvgNft.getHighImageURI()
                  assert(tokenUri.includes(highTokenUri))
              })
          })

          describe("transfer", async function () {
              it("nft transfered from owner to user1 by owner", async function () {
                  await dynamicSvgNft.mintNft(1)
                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  let owner = await dynamicSvgNft.ownerOf(tokenCounter)
                  assert.equal(owner, deployerAddress)

                  await dynamicSvgNft["safeTransferFrom(address,address,uint256)"](
                      deployerAddress,
                      user1Address,
                      tokenCounter
                  )

                  owner = await dynamicSvgNft.ownerOf(tokenCounter)
                  assert.equal(owner, user1Address)
              })

              it("nft transfered from owner to user1 by user1 after owner approve", async function () {
                  await dynamicSvgNft.mintNft(1)
                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  let owner = await dynamicSvgNft.ownerOf(tokenCounter)
                  assert.equal(owner, deployerAddress)

                  await dynamicSvgNft.approve(user1Address, tokenCounter)

                  await dynamicSvgNftUser1["safeTransferFrom(address,address,uint256)"](
                      deployerAddress,
                      user1Address,
                      tokenCounter
                  )
                  owner = await dynamicSvgNft.ownerOf(tokenCounter)
                  assert.equal(owner, user1Address)
              })
              it("not allowed to transfer nft from owner to user1 by user1 if owner does not approve", async function () {
                  await dynamicSvgNft.mintNft(1)
                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  let owner = await dynamicSvgNft.ownerOf(tokenCounter)
                  assert.equal(owner, deployerAddress)

                  await expect(
                      dynamicSvgNftUser1["safeTransferFrom(address,address,uint256)"](
                          deployerAddress,
                          user1Address,
                          tokenCounter
                      )
                  ).to.be.revertedWith("ERC721: caller is not token owner nor approved")
              })

              it("owner give approve for all nft for user1", async function () {
                  await dynamicSvgNft.mintNft(1)
                  await dynamicSvgNft.mintNft(1)
                  await dynamicSvgNft.mintNft(1)
                  await dynamicSvgNft.setApprovalForAll(user1Address, true)
                  assert(dynamicSvgNftUser1.isApprovedForAll(deployerAddress, user1Address))
              })
              it("owner does not give approve for all nft for user1", async function () {
                  await dynamicSvgNft.mintNft(1)
                  await dynamicSvgNft.mintNft(1)
                  await dynamicSvgNft.mintNft(1)
                  expect(
                      await dynamicSvgNftUser1.isApprovedForAll(deployerAddress, user1Address)
                  ).to.equal(false)
              })
          })
      })
