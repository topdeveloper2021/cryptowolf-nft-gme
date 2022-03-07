// npx hardhat run scripts/change_minter_variables.js --network 

const hre = require("hardhat");

async function main() {

    //sconst ClaimProxy = await hre.deployments.get('Claim_Proxy');
    const ClaimDeployed = await hre.ethers.getContractAt('Claim', '0x91aaFd787eD7A23b2472645CF52DBc19DA3619f0');

    console.log(await ClaimDeployed.minterWalletAddress());
    const tx = await ClaimDeployed.changeAddressMinterWallet('0xEE73d462C6F615954BF1E515BA3d11F23d14aa5e');
    console.log(tx);
    console.log(await ClaimDeployed.minterWalletAddress());

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

