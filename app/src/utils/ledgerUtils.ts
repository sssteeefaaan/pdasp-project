import { config as dotenvConfig } from "dotenv";
import { Gateway } from "fabric-network";
import { Contract } from "fabric-network/lib/contract";
import { Network } from "fabric-network/lib/network";

import { join as pathJoin, resolve as pathResolve } from "path";

import { buildCAClient, registerAndEnrollUser, enrollAdmin } from "./caUtils";
import { buildCCPOrg, buildWallet } from "./orgUtils";

dotenvConfig({ path: pathResolve('environments', 'ledger.env') });
const env = process.env;

const channelName = env["CHANNEL_NAME"] || 'mychannel';
const chaincodeName = env["CHAINCODE_NAME"] || 'basic';
const organizationId = parseInt(env["ORGANIZATION_ID"] || "1");
const mspOrg = `Org${organizationId}MSP`;
const walletPath = pathJoin(__dirname, env["WALLET_PATH"] || 'wallet');
const orgUserId = env["ORGANIZATION_USER_ID"] || 'appUser';
const affiliation = env["AFFILIATION"] || `manufacturer.department1`;

let contract : Contract | null = null;
let gateway : Gateway | null = null;
let network : Network | null = null;

const getGateway = async() : Promise<Gateway> => {
    if(gateway != null){
        return gateway;
    }

    try {
		const ccp = buildCCPOrg(organizationId);
        const caClient = buildCAClient(ccp, `ca.org${organizationId}.example.com`);
        const wallet = await buildWallet(walletPath);
        await enrollAdmin(caClient, wallet, mspOrg);
        await registerAndEnrollUser(caClient, wallet, mspOrg, orgUserId, affiliation);
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

    return gateway as Gateway;
}

const getNetwork = async() : Promise<Network> => {
    if(network != null){
        return network;
    }

    try{
        network = await (await getGateway()).getNetwork(channelName);
    }catch(error){
        console.error(`********* Failed to get network: ${error}`);
    }

    return network as Network;
}
const getContract = async() : Promise<Contract> => {
    if(contract != null){
        return contract;
    }

    try{
        contract = await (await getNetwork()).getContract(chaincodeName);
    }catch(error){
        console.error(`********* Failed to get contract: ${error}`);
    }

    return contract as Contract;
}

export {
    getContract,
    getNetwork,
    getGateway
};
