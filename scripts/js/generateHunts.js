import { chunks } from "chunk-array";
import { MultiCall } from "eth-multicall";
import keccak256 from "keccak256";
import { createRequire } from "module";
import { v4 as uuidv4 } from "uuid";
import Web3 from "web3";

const require = createRequire(import.meta.url);
const HuntingNFTJSON = require("./HuntingNFT.json");
const LossesSeedsJSON = require("./LossesSeeds.json");

const env = {
  PRIVATE_KEY_HUNT:
    "23a6f4ff04fef91fd4b94ade2800fc8b97d8825c4ecb6a9a84e046087608e465",
  PUBLIC_MULTICALL: "0x5FEe37c8812cB28d32B077B706ed08dcbE53108f",
};

const generateHunts = async () => {
  const web3 = await new Web3(
    new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
  );

  const account = await web3.eth.accounts.privateKeyToAccount(
    env.PRIVATE_KEY_HUNT
  );
  console.log(account.address);
  web3.eth.accounts.wallet.add(account);

  const contract = new web3.eth.Contract(
    HuntingNFTJSON.abi,
    HuntingNFTJSON.address
  );

  const totalSupply = await contract.methods.totalSupply().call();
  console.log("totalSupply: " + totalSupply);
  let ids = Array.from(Array(parseInt(5000)).keys());
  ids = ids.map((x) => totalSupply - x - 1).reverse();

  const chunksIds = chunks(ids, 10000);

  const multicall = new MultiCall(web3, env.PUBLIC_MULTICALL);

  await new Promise((r) => setTimeout(r, 15000));

  const lossesSeeds = LossesSeedsJSON.seeds;

  let resultsIndex = ids[0];
  (async function () {
    for await (const chunk of chunksIds) {
      const calls = [];
      for await (const id of chunk) {
        calls.push({ generated: await contract.methods.isGenerated(id) });
      }
      const results = await multicall.all([calls]);

      const callsPosition = [];
      for await (const id of chunk) {
        callsPosition.push({
          position: await contract.methods.positionToAttack(id),
        });
      }
      const resultsPosition = await multicall.all([callsPosition]);

      const callsWallet = [];
      for await (const id of chunk) {
        callsWallet.push({
          wallet: await contract.methods.ownerOf(id),
        });
      }
      const resultsWallet = await multicall.all([callsWallet]);

      const resultsCombined = [];
      for (let index = 0; index < resultsWallet[0].length; index++) {
        const elementCombined = {
          position: resultsPosition[0][index].position,
          wallet: resultsWallet[0][index].wallet,
          generated: results[0][index].generated,
        };
        resultsCombined.push(elementCombined);
      }

      let pending = [];
      let pendingTarget = [];
      for await (const result of resultsCombined) {
        const randomNumber = Math.floor(Math.random() * 5) + 1;

        if (!result.generated && resultsIndex != 0) {
          if (result.position >= 13 && randomNumber != 1) {
            pendingTarget.push(resultsIndex);
          } else {
            pending.push(resultsIndex);
          }
        }

        resultsIndex++;
      }

      for await (const chunkPending of chunks(pendingTarget, 1)) {
        const seed = lossesSeeds[Math.floor(Math.random() * lossesSeeds.length)];

        try {
          let gas = "9000000";
          const gasPrice = await web3.eth.getGasPrice();

          await contract.methods.generateResult(chunkPending, seed).estimateGas(
            {
              from: account.address,
              gasPrice: gasPrice,
            },
            function (error, estimatedGas) {
              if (error == null && estimatedGas != null && estimatedGas > 0) {
                gas = estimatedGas;
              }
            }
          );

          await contract.methods.generateResult(chunkPending, seed).send({
            from: account.address,
            to: HuntingNFTJSON.address,
            gasPrice: gasPrice,
            gas: Number(gas).toString(),
          });

          console.log("Chunk Target generated");
          await new Promise((r) => setTimeout(r, 2500));
        } catch (error) {
          console.log(error);
          await new Promise((r) => setTimeout(r, 2500));
        }
      }

      for await (const chunkPending of chunks(pending, 20)) {
        const uuid = uuidv4();
        const seed = `0x${keccak256(uuid).toString("hex")}`;

        try {
          let gas = "9000000";
          const gasPrice = await web3.eth.getGasPrice();

          await contract.methods.generateResult(chunkPending, seed).estimateGas(
            {
              from: account.address,
              gasPrice: gasPrice,
            },
            function (error, estimatedGas) {
              if (error == null && estimatedGas != null && estimatedGas > 0) {
                gas = estimatedGas;
              }
            }
          );

          await contract.methods.generateResult(chunkPending, seed).send({
            from: account.address,
            to: HuntingNFTJSON.address,
            gasPrice: gasPrice,
            gas: Number(gas).toString(),
          });

          console.log("Chunk generated");
          await new Promise((r) => setTimeout(r, 2500));
        } catch (error) {
          console.log(error);
          await new Promise((r) => setTimeout(r, 2500));
        }
      }
    }
  })();

  return true;
};

generateHunts();
