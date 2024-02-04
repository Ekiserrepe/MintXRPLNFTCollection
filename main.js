//Modify these fields before running your code

//Number of NFTokens (NFTs) you want to mint
const numberNFTs = 5;
//Select your network "Testnet" or "Mainnet"
const net = "Testnet";
//Secret of your wallet (Don't share it!) Testnet address generator: https://xrpl.org/xrp-testnet-faucet.html Fake example: "sn5XTrWNGNysp4o1JYEFp7wSbN6Gz"
const seed = "sEd79DNQKP7cS1RFEgqhGrF94WQQvVw";
//Price of every NFT in XRP. Example: for 1 XRP price per NFT, put 1
const xrp = 10;
//CID from tour ipfs files without 'ipfs://' part. Fake example: 'bafybeigyy2u2sbgtxxr2tdc6snxgefdo52bx2qy2nd3vjrjzaieg4yr3ce'
const ipfs_cid = "bafqbeigrsqxvodv424n5imp22wjurbo3kdsugn56kgkmr4bj4ubywphirq";
//NFT flags, this is a sum of properties, sum all you want.
const nft_flags = 8;
//Royalties fee,Example: for a 5% of royalties, put 5, for a 10%, put 10. Attention: 50% is the maximun.
const royalties_fee = 5;
//Taxon, the number  that represents your collection in your wallet. For your first collection use 0, next one the 1, etc... up to you.
const taxon=3;
//End modify variables

//Don't touch anything after this line
const xrpl = require("xrpl");
const { XrplAccountLib } = require("xrpl");

async function main() {
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const price = xrp * 1000000;
  let network = "wss://s.altnet.rippletest.net:51233/";
  if (net === "Mainnet") {
    network = "wss://xrplcluster.com/";
  }
  const royalties = royalties_fee*1000;
  const client = new xrpl.Client(network);
  await client.connect();
  const my_wallet = xrpl.Wallet.fromSeed(seed);
  console.log(`Your public address is: ${my_wallet.address}`);
  const response = await client.request({
    command: "account_info",
    account: my_wallet.address,
    ledger_index: "validated",
  });
  const total_balance = response.result.account_data.Balance / 1000000;
  const reserves = response.result.account_data.OwnerCount * 2 + 10;
  console.log(
    `Your total balance (available+reserves) is: ${total_balance} XRP`
  );
  console.log(`Your reserves is: ${reserves} xrp`);
  const balance = total_balance - reserves;
  console.log(`Your available balance is: ${balance} xrp`);
  //The reserve per object is 2 but I prefer to be safe
  const TicketTotalCost = numberNFTs * 2.1;
  console.log(
    `To create the tickets needed, you need to have at least this balance: ${TicketTotalCost} XRP`
  );
  if (balance <= TicketTotalCost) {
    console.log(
      `To create the tickets needed, you need to have at least this balance: ${TicketTotalCost} XRP. I recommend have a bit more.`
    );
    client.disconnect();
    console.log(`Connection closed`);
  } else {
    //We check how many tickets you had before running the code
    let response = await client.request({
      command: "account_objects",
      account: my_wallet.address,
      type: "ticket",
    });
    let numberTickets = 0;
    if (
      Array.isArray(response.result.account_objects) &&
      response.result.account_objects.length > 0
    ) {
      numberTickets = response.result.account_objects.length;
      console.log(`This account has ${numberTickets} tickets already`);
    } else {
      console.log("This account has no tickets already");
    }

    const account_info = await client.request({
      command: "account_info",
      account: my_wallet.address,
    });
    numberTickets = numberNFTs - numberTickets;
    console.log(`${numberTickets} tickets will be created`);
    if (numberTickets > 0) {
      let current_sequence = account_info.result.account_data.Sequence;
      console.log("Actual Sequence", current_sequence);
      //Generate tickets:
      const prepared = await client.autofill({
        TransactionType: "TicketCreate",
        Account: my_wallet.address,
        TicketCount: numberTickets,
        Sequence: current_sequence,
      });

      const signed = my_wallet.sign(prepared);
      console.log(`Getting ready tx TicketCreate  ${signed.hash}`);

      // Submit TicketCreate
      const tx = await client.submitAndWait(signed.tx_blob);
      console.log("Info tx ", tx);

      const jsonDataString = JSON.stringify(tx);
      console.log(jsonDataString);
      //finished
      await wait(10000);
    } else {
      console.log(
        `New tickets are not created. You have enough created already.`
      );
    }

    const response2 = await client.request({
      command: "account_objects",
      account: my_wallet.address,
      type: "ticket",
    });
    console.log(
      "Checking the tickets created are enough for your bulk minting, wait 10 seconds..."
    );
    let tickets = [];
    await wait(10000);
    for (let i = 0; i < numberNFTs; i++) {
      y = i + 1;
      tickets[i] = response2.result.account_objects[i].TicketSequence;
      console.log("Generated tickets nº ", y, tickets[i]);
    }
    console.log("Ticket generation finished");
    if (numberNFTs > response2.result.account_objects.length) {
      console.log(`Tickets needed ${numberNFTs}`);
      console.log(`Tickets created ${response2.result.account_objects.length}`);
      console.log(
        `You need more tickets to start the mint, re-execute this code.`
      );
    } else {
      console.log(`Tickets needed ${numberNFTs}`);
      console.log(`Tickets created ${response2.result.account_objects.length}`);

      //Let's get our tickets
      let accObjRequest = {
        command: "account_objects",
        account: my_wallet.address,
        type: "ticket",
        ledger_index: "validated",
      };

      let accObjResponse = await client.request(accObjRequest);

      let ticketObjects = [];

      if (accObjResponse?.result?.account_objects) {
        ticketObjects = accObjResponse?.result?.account_objects;

        let marker = accObjResponse.result.marker;

        while (marker) {
          accObjRequest.marker = marker;
          accObjRequest.ledger_index = accObjResponse.result.ledger_index;

          accObjResponse = await client.request(accObjRequest);

          marker = accObjResponse?.result?.marker;

          if (accObjResponse?.result?.account_objects) {
            ticketObjects = ticketObjects.concat(
              accObjResponse.result.account_objects
            );
          } else {
            marker = null;
          }
        }
      }
      let tickets = [];

      for (let i = 0; i < numberNFTs; i++) {
        tickets[i] = ticketObjects[i].TicketSequence;
        console.log("ticket", i, tickets[i]);
      }
      console.log(tickets);

      console.log(`Let's mint!`);

      for (let i=0; i < numberNFTs; i++) {
        y=i+1
        const transactionBlob = {
            "TransactionType": "NFTokenMint",
            "Account": my_wallet.address,
            "URI": xrpl.convertStringToHex(`ipfs://${ipfs_cid}/${y}.json`),
            "Flags": nft_flags,
            "TransferFee": royalties,
            "Sequence": 0,
            "TicketSequence": tickets[i],
            "LastLedgerSequence": null,
            "NFTokenTaxon": taxon 
        }
        
        console.log();
        console.log(JSON.stringify(transactionBlob));
        const tx =  await client.submit(transactionBlob, { wallet: my_wallet} )
        console.log('TX Json');
        console.log("Asking summiting tx ",y)
        console.log(tx.result);
    }
    console.log("Mint is over. Wait 10 seconds until continue with offers...");
   
    
    //Start create offers
    await wait(10000);
console.log('Created account_info')
    const nfts = await client.request({
        method: "account_nfts",
        account: my_wallet.classicAddress
    })
    console.log('Creating allNfts')
    let allNfts = nfts.result.account_nfts
    console.log('allNFTs created')
    let marker = nfts.result.marker
    console.log('Maker created')
    console.log('marker',marker)
    while(marker) {
        nfts.result.marker=marker
        console.log('nfts.ledger_index',nfts.ledger_index)
        nfts.ledger_index = nfts.result.ledger_current_index
        console.log('nfts.result.ledger_current_index',nfts.result.ledger_current_index)
        console.log('nfts.ledger_index',nfts.ledger_index)
        const nfts2 = await client.request({
            method: "account_nfts",
            account: my_wallet.classicAddress,
            ledger_index: nfts.ledger_index,
            marker: nfts.result.marker
        })
        marker = nfts2.result.marker
        console.log('nfts2.result.marker',nfts2.result.marker)
        console.log('marker',marker)
        console.log('nfts2.result.ledger_current_index',nfts2.result.ledger_current_index)
        
        if(nfts2.result.account_nfts){
            allNfts= allNfts.concat(nfts2.result.account_nfts)
        } else {
            marker=null
        }

    }
    
   
    for (let i=0; i < allNfts.length; i++) {
    
        if(allNfts[i].NFTokenTaxon==taxon){
            const transactionBlob = {
                
                    "TransactionType": "NFTokenCreateOffer",
                    "Account": my_wallet.classicAddress,
                    "NFTokenID": allNfts[i].NFTokenID,
                    "Amount": `${price}`,
                    "Flags": 1
                
            }

            const tx =  await client.submit(transactionBlob, { wallet: my_wallet} )
            console.log('tx',i,tx)
            console.log('tx.result',i,tx.result)
            console.log("Asking submit for the NFT offer: ",i,allNfts[i].NFTokenID)
           
        }
    }
    console.log('Create offers ends here');

    }


  }
}
main();
