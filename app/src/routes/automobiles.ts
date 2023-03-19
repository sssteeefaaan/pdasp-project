import { Router } from "express";

import { getContract } from "../utils/ledgerUtils";

const router = Router();

router.post("/create-new-automobile", async(req, res) => {
    try{
        let id: string;
        let brand : string;
        let model : string;
        let color: string;
        let year : string;
        let price: string;
        let ownerId: string;

        try{
            id = req.body["id"] as string;
            if(id.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Id is a mandatory field!"});
        }

        try{
            brand = req.body["brand"] as string;
            if(brand.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Brand is a mandatory field!"});
        }

        try{
            model = req.body["model"] as string;
            if(model.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Model is a mandatory field!"});
        }

        try{
            color = req.body["color"] as string;
            if(color.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Color is a mandatory field!"});
        }

        try{
            price = req.body["price"] as string;
            if(price.length < 1)
                throw "";
            const priceFloat = parseFloat(price);
            if(isNaN(priceFloat) || priceFloat < 0)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Price is a mandatory field that must be a positive real number!"});
        }

        try{
            year = req.body["year"] as string;
            if(year.length < 1)
                throw "";
            const yearInt = parseInt(year);
            if(isNaN(yearInt) || yearInt < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Year is a mandatory field that must be a positive whole number!"});
        }

        try{
            ownerId = req.body["ownerId"] as string;
            if(ownerId.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "OwnerId is a mandatory field!"});
        }

        color = color.toLowerCase();
        const firstLetter = color.charAt(0).toUpperCase();
        if(color.length > 1)
            color = firstLetter + color.slice(1);
        else
            color = firstLetter;

        const contract = await getContract();
        const result = await contract.submitTransaction("CreateAutomobile", id, brand, model, color, year, price, ownerId);
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.patch("/change-color", async(req, res) => {
    try{
        let id : string;
        let color : string;

        try{
            id = req.body["id"] as string;
            if(id.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Id is a mandatory field!"});
        }

        try{
            color = req.body["color"] as string;
            if(color.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Color is a mandatory field!"});
        }

        color = color.toLowerCase();
        const firstLetter = color.charAt(0).toUpperCase();
        if(color.length > 1)
            color = firstLetter + color.slice(1);
        else
            color = firstLetter;

        const contract = await getContract();
        const result = await contract.submitTransaction("ColorAutomobile", id, color);
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.patch("/change-ownership", async(req, res) => {
    try{
        let id : string;
        let newOwnerId : string;
        let changeWithMalfunctions : string;

        try{
            id = req.body["id"] as string;
            if(id.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Id is a mandatory field!"});
        }

        try{
            newOwnerId = req.body["newOwnerId"] as string;
            if(newOwnerId.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "NewOwnerId is a mandatory field!"});
        }

        try{
            changeWithMalfunctions = req.body["changeWithMalfunctions"] as string;
            console.log(changeWithMalfunctions);
            if(!{false: true, true: true}[changeWithMalfunctions]){
                throw "";
            }
        }catch(_){
            return res.status(400).send({message: "ChangeWithMalfunctions is a mandatory field of type Boolean!"});
        }

        const contract = await getContract();
        const result = await contract.submitTransaction("ChangeOwnership", id, newOwnerId, changeWithMalfunctions);
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.get("/read-all", async(req, res) => {
    try{
        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAllAutomobiles");
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.get("/read-my-garage/:ownerId", async(req, res) => {
    try{
        let ownerId : string;

        try{
            ownerId = req.params.ownerId as string;
            if(ownerId.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "OwnerId is a mandatory field!"});
        }

        const query = { selector: { _id: { "$regex": "^automobile:" }, ownerId } };
        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAutomobilesQuery", JSON.stringify(query));
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.get("/read-filtered/:color", async(req, res) => {
    try{
        let color: string;

        try{
            color = req.params.color as string;
            if(color.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Color is a mandatory field!"});
        }

        color = color.toLowerCase();
        const firstLetter = color.charAt(0).toUpperCase();
        if(color.length > 1)
            color = firstLetter + color.slice(1);
        else
            color = firstLetter;

        const query = { selector: { _id: { "$regex": "^automobile:" }, color } };
        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAutomobilesQuery", JSON.stringify(query));
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.get("/read-filtered/:color/:ownerId", async(req, res) => {
    try{
        let ownerId : string;
        let color: string;

        try{
            ownerId = req.params.ownerId as string;
            if(ownerId.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "OwnerId is a mandatory field!"});
        }

        try{
            color = req.params.color as string;
            if(color.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Color is a mandatory field!"});
        }

        color = color.toLowerCase();
        const firstLetter = color.charAt(0).toUpperCase();
        if(color.length > 1)
            color = firstLetter + color.slice(1);
        else
            color = firstLetter;

        const query = { selector: { _id: { "$regex": "^automobile:" }, color, ownerId } };
        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAutomobilesQuery", JSON.stringify(query));
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

router.get("/:id", async(req, res) => {
    try{
        let id : string;

        try{
            id = req.params.id as string;
            if(id.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Id is a mandatory field!"});
        }

        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAutomobile", id);
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

export { router };