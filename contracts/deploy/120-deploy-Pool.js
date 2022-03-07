require("dotenv").config({ path: "./../.env.private" }).parsed;
const hre = require("hardhat");
const sleep = require('sleep-promise');

module.exports = async ({ getNamedAccounts, deployments, getChainId, network }) => {

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    [deployerWallet, minterWallet, rewardsWallet] = await ethers.getSigners();

    let cWolfToken;
    let variablesAddress;
    let rewardsPoolAddress;
    let cWolfPerBlock;
    let feeAddress;

    if (network.name === 'bscTestnet'){
        cWolfToken = "0x0e5903749fCa586a0d22F2d190A49008D21894a6";
        variablesAddress = "0x49f1FbdBF25A55F220dd22aea728B621c9223212";
        rewardsPoolAddress = "0xb6f7D26AEDCAf1E4B753F1854B13C39cc00EDd28";
        cWolfPerBlock = "416666667000000000";
        feeAddress = "0xb6f7D26AEDCAf1E4B753F1854B13C39cc00EDd28";
    }
    else if(network.name === 'bscMainnet') {
        cWolfToken = "0x8c5921a9563e6d5dda95cb46b572bb1cc9b04a27";
        variablesAddress = "0x7D8d08b7D9E436E6a6c115e45051e8BD85FF7E09";
        rewardsPoolAddress = "0x82476fD33ffb2D30fFA2130Cde1742fC088687F0";
        cWolfPerBlock = "416666667000000000";
        feeAddress = "0x82476fD33ffb2D30fFA2130Cde1742fC088687F0";
    }

    const Pool = await hre.ethers.getContractFactory('Pool');
    const pool = await Pool.deploy(
        cWolfToken,
        variablesAddress,
        rewardsPoolAddress,
        cWolfPerBlock,
        0,
        feeAddress
    );
    console.log("Pool deployed at: ", pool.address);

};
module.exports.tags = ['Pool'];
