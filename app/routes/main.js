const router = require("express").Router();

router.get("/:osoba", (req, res) => {
    try{
        const chars = req.params.osoba.split('')
        console.log(chars)
        let osoba = chars[0].toUpperCase()
        if(chars.length > 1)
            osoba += chars.slice(1).join('').toLowerCase()
        console.log(req.hostname, osoba)
        res.render("templates/main", {osoba})
    }catch(e)
    {
        console.log(e)
        res.render("templates/main", {osoba: "Naughty, naughty"})
    }
});

router.get("/", (req, res) => {
    res.render("templates/mladenko")
});

module.exports = router;