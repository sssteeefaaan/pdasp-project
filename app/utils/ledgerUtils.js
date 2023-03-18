require("dotenv").config({ path: `${__dirname}/ledger.env` });
const env = process.env;

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./caUtils.js');
const { buildCCPOrg, buildWallet } = require('./orgUtils.js');

const channelName = env["CHANNEL_NAME"] || 'mychannel';
const chaincodeName = env["CHAINCODE_NAME"] || 'basic';
const organizationId = env["ORGANIZATION_ID"] || "1";
const mspOrg = `Org${organizationId}MSP`;
const walletPath = path.join(__dirname, env["WALLET_PATH"] || 'wallet');
const orgUserId = env["ORGANIZATION_USER_ID"] || 'appUser';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

let contract = null;
let gateway = null;
let network = null;

const getGateway = async() => {
    if(gateway != null){
        return gateway;
    }

    try {
		const ccp = buildCCPOrg(organizationId);
        const caClient = buildCAClient(FabricCAServices, ccp, `ca.org${organizationId}.example.com`);
        const wallet = await buildWallet(Wallets, walletPath);
        await enrollAdmin(caClient, wallet, mspOrg);
        await registerAndEnrollUser(caClient, wallet, mspOrg, orgUserId, `manufacturer.department1`);
        gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: orgUserId,
				discovery: { enabled: true, asLocalhost: true }
			});
		}catch(error){
            console.error(`******** FAILED to connect: ${error}`);
        }
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}

    return gateway;
}

const getNetwork = async() => {
    if(network != null){
        return network;
    }

    try{
        network = await (await getGateway()).getNetwork(channelName);
    }catch(error){
        console.error(`********* Failed to get network: ${error}`);
    }

    return network;
}
const getContract = async() => {
    if(contract != null){
        return contract;
    }

    try{
        contract = await (await getNetwork()).getContract(chaincodeName);
    }catch(error){
        console.error(`********* Failed to get contract: ${error}`);
    }

    return contract;
}

module.exports = {
    getContract,
    getNetwork,
    getGateway,
    prettyJSONString
};
