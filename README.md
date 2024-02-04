# Mint A NFToken Collection

Process to mint an NFToken Collection on XRP Ledger

# Requisites

The user needs to provide to the process to provide (order as how is asked in the code):

* Declare the number of NFTs you are going to mint.

* Declare the network: Mainnet or Testnet (I always recommend testing the collection on Testnet before minting on Mainnet).

* The seed of the wallet where you want to mint (Don't share it and keep it safe!).

* Declare the price of each NFT, for example 10 XRP.

* CID of the IPFS collection json files, you have to upload your .json files in the same url, numbered like 1.json , 2.json, 3.json....

* Declare the taxon for the collection.

* Declare flags. You need to sum values. More info: https://xrpl.org/nftoken.html#nftoken-flags 

* Your wallet must to have enough XRP available to run the process. For each ticket reservation you need 2 XRP, to be safe we can use 2.1 as safe value. If you have a 10 NFT collection, try to have 10*2= 20 XRP as balance available at least, it will be better having some XRP extra available.

# Notes

This is just an example code, I'm sure there are better ways to do this. I'm not a profesional developer and it is just a sample for those who want to play with XRP Ledger.

# Documentation

* Documentation: https://xrpl.org/
* Testnet Faucet: https://xrpl.org/xrp-testnet-faucet.html

# Donate

I use most of my time collaborating in the XRP Ledger ecosystem with different activities and supporting other developers, projects or infrastructure. Feel free to donate XRP to the address rf1NrYAsv92UPDd8nyCG4A3bez7dhYE61r
