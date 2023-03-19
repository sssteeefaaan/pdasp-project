import dotenv from "dotenv";
import FabricCAServices from "fabric-ca-client";
import { User } from "fabric-common";
import { Wallet } from "fabric-network";

import { resolve as pathResolve } from "path";

dotenv.config({ path: pathResolve('environments', 'ledger.env') });
const env = process.env;

const adminUserId = env["CA_ADMIN_USER"] || 'admin';
const adminUserPasswd = env["CA_ADMIN_PASSWORD"] || 'adminpw';

const buildCAClient = (ccp : any, caHostName : string) : FabricCAServices => {
	const caInfo = ccp.certificateAuthorities[caHostName];
	const caTLSCACerts = caInfo.tlsCACerts.pem;
	const caClient = new FabricCAServices(caInfo.url, {
		trustedRoots: caTLSCACerts,
		verify: false
	}, caInfo.caName);

	console.log(`Built a CA Client named ${caInfo.caName}`);
	return caClient;
};

const enrollAdmin = async (caClient : FabricCAServices, wallet : Wallet, orgMspId: string) => {
	try {
		const identity = await wallet.get(adminUserId);
		if (identity) {
			console.log('An identity for the admin user already exists in the wallet');
			return;
		}

		const enrollment = await caClient.enroll({
			enrollmentID: adminUserId,
			enrollmentSecret: adminUserPasswd
		});
		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: orgMspId,
			type: 'X.509',
		};

		await wallet.put(adminUserId, x509Identity);
		console.log('Successfully enrolled admin user and imported it into the wallet');
	} catch (error) {
		console.error(`Failed to enroll admin user : ${error}`);
	}
};

const registerAndEnrollUser = async (caClient : FabricCAServices, wallet : Wallet, orgMspId : string, userId : string, affiliation : string) => {
	try {
		const userIdentity = await wallet.get(userId);
		if (userIdentity) {
			console.log(`An identity for the user ${userId} already exists in the wallet`);
			return;
		}

		const adminIdentity = await wallet.get(adminUserId);
		if (!adminIdentity) {
			console.log('An identity for the admin user does not exist in the wallet');
			console.log('Enroll the admin user before retrying');
			return;
		}

		const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
		const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

		if(!await checkIfAffiliationExists(caClient, affiliation, adminUser)){
			await createAffiliation(caClient, adminUser, affiliation);
		}

		const secret = await caClient.register({
			affiliation,
			enrollmentID: userId,
			role: 'client'
		}, adminUser);

		const enrollment = await caClient.enroll({
			enrollmentID: userId,
			enrollmentSecret: secret
		});
		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: orgMspId,
			type: 'X.509',
		};
		await wallet.put(userId, x509Identity);
		console.log(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);
	} catch (error) {
		console.error(`Failed to register user : ${error}`);
	}
};

const createAffiliation = async(caClient : FabricCAServices, user : User, affiliation : string) =>{
	const affiliationService = caClient.newAffiliationService();
	const response = await affiliationService.create({name: affiliation, caname: caClient.getCaName(), force: true}, user);
	if(response.success){
		console.log(`Successfully created Affiliation ${affiliation}!`);
	}else{
		console.log(`Failed to create Affiliation ${affiliation}! ${response.errors}`);
	}
}

const checkIfAffiliationExists = async(caClient : FabricCAServices, affiliation: string, user : User) : Promise<boolean> => {
	const affiliationService = caClient.newAffiliationService();
	try{
		const response = await affiliationService.getOne(affiliation, user);
		return response.success;
	}catch(_){
		return false;
	}
}

export { buildCAClient, registerAndEnrollUser, createAffiliation, enrollAdmin };
