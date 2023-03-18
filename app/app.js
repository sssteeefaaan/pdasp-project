const express = require('express')
const app = express()
const port = 8080
const path = require('path')

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, 'public')))

app.use("/main", require("./routes/main"));
app.use("/init", require("./routes/init"));
app.use("/people", require("./routes/people"));
app.use("/automobiles", require("./routes/automobiles"));
app.use("/malfunctions", require("./routes/malfunctions"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})