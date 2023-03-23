import { ethers } from "ethers";
import csv from "csv-parser";
import * as fs from "fs";
import {
  rpc,
  claimContractAddress,
  tokenAddress,
  claimABI,
  tokenABI,
  cexWallet,
} from "./config.js";
// define provider:
const provider = new ethers.providers.JsonRpcProvider(rpc);

// read data from csv
const results = [];
fs.createReadStream("test.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", async () => {
    for (let i = 0; i < results.length; i++) {
      try {
        const signer = new ethers.Wallet(results[i].pkey, provider);
        console.log(`Connected: ${signer.address}`);
        const claimContract = new ethers.Contract(
          claimContractAddress,
          claimABI,
          signer
        );
        const tokenContract = new ethers.Contract(
          tokenAddress,
          tokenABI,
          signer
        );
        // start claim
        const tx1 = await claimContract.claim({
          gasLimit: 1000000,
        });
        await tx1.wait();
        // // start transfer
        const balance = await tokenContract.balanceOf(signer.address);
        console.log(`Balance: ${balance.toString()}`);
        console.log(`Transfer to ${cexWallet}`);
        const tx2 = await tokenContract.transfer(cexWallet, balance, {
          gasLimit: 1000000,
        });
        await tx2.wait();
      } catch (ex) {
        console.log("Error", ex);
      }
    }
  });
