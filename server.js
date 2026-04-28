const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

const PORT = 3000;

const server = http.createServer((req, res) => {

    if (req.method === 'GET' && req.url === "/") {
        fs.readFile("protectaccess.html", 'utf8', (err, data) => {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(data);
            res.end();
        });
    }

    else if (req.method === "POST" && req.url === "/protectaccess") {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            const formData = querystring.parse(body);

            const name = formData.name;
            const password = formData.pw;
            let id = formData.IDnumber;

            // validation

            const nameValid = name && !/^\d+$/.test(name);

            const passwordValid = password.length >= 10 && /[A-Za-z]/.test(password) && /\d/.test(password);

            const noDash = /^\d{12}$/;
            const withDash = /^\d{3}-\d{3}-\d{3}-\d{3}$/;

            const idValid = noDash.test(id) || withDash.test(id) && !/\./.test(id)

            const isValid = nameValid && passwordValid && idValid;

            const cleanID = id.replace(/[-/:.]/g, "");

            const hiddenPassword = "*".repeat(password.length);


            const resultText = `${name}, ${hiddenPassword}, ${cleanID}`;

            fs.writeFileSync("accessresults.txt", resultText);

            // output
            fs.readFile("accessresults.txt", "utf8", (err, resultFile) => {

                fs.readFile("protectaccess.html", "utf8", (err2, htmlFile) => {

                    res.writeHead(200, { "Content-Type": "text/html" });

                    res.write(htmlFile);

                    // STATUS MESSAGE
                    if (isValid) {
                        res.write("<h1 style='color:green;'>Successful.</h1><br>");
                    } else {
                        res.write("<h1 style='color:red;'>Access Denied! Invalid Data.</h1><br>");
                    }

                    // SUBMITTED DATA
                    res.write(`<p>${resultText}</p>`);

                    res.end();
                });
            });
        });
    }
})



server.listen(PORT, 'localhost', () => {
    console.log(`Server is running on http://localhost:${PORT}/`)
});