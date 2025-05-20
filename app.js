const { urlencoded } = require('body-parser');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static('./public'));
app.use(urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.use((req, res) => {
    res.status(404).send("This is a 404 page");
});

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});;