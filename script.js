const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

const pageTitle = document.getElementById("pageTitle");
const dashboardSection = document.getElementById("dashboardSection");
const documentsSection = document.getElementById("documentsSection");
const searchSection = document.getElementById("searchSection");

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadMessage = document.getElementById("uploadMessage");
const documentList = document.getElementById("documentList");
const documentCount = document.getElementById("documentCount");

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

let documents = [];
async function loadDocuments() {
    try {
        const response = await fetch(
            "http://127.0.0.1:8000/api/documents"
        );

        if (!response.ok) {
            throw new Error("Could not load documents.");
        }

        const data = await response.json();

        documents = data.documents.map(function (doc) {
            return {
                name: doc.name,
                size: doc.size
            };
        });

        updateDocumentList();

    } catch (error) {
        console.error("Document loading failed:", error);
    }
}

function showPage(page) {
    dashboardSection.hidden = page !== "dashboard";
    documentsSection.hidden = page !== "documents";
    searchSection.hidden = page !== "search";

    const titles = {
        dashboard: "Dashboard",
        documents: "Documents",
        search: "Document Search"
    };

    pageTitle.textContent = titles[page] || "Dashboard";
}

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const demoEmail = "admin@secureportal.com";
    const demoPassword = "Portal@123";

    if (!email || !password) {
        loginMessage.textContent =
            "Please enter your email and password.";
        return;
    }

    if (
        email.toLowerCase() !== demoEmail ||
        password !== demoPassword
    ) {
        loginMessage.textContent =
            "Invalid email or password. Please try again.";
        return;
    }

    userEmail.textContent = email;
    loginPage.hidden = true;
    dashboardPage.hidden = false;
    loginMessage.textContent = "";

    showPage("dashboard");
    loadDocuments();
});

document.querySelectorAll(".nav-button").forEach(function (button) {
    button.addEventListener("click", function () {
        showPage(button.dataset.page);
    });
});

logoutBtn.addEventListener("click", function () {
    dashboardPage.hidden = true;
    loginPage.hidden = false;
    loginForm.reset();
    userEmail.textContent = "";
    showPage("dashboard");
});

fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
        uploadMessage.textContent =
            "Selected: " + fileInput.files[0].name;
    } else {
        uploadMessage.textContent = "";
    }
});

uploadBtn.addEventListener("click", async function () {
    const file = fileInput.files[0];

    if (!file) {
        uploadMessage.textContent = "Please choose a document first.";
        return;
    }

    const allowedExtensions = [
    ".pdf", ".docx", ".txt",
    ".jpg", ".jpeg", ".png",
    ".ppt", ".pptx",
    ".xls", ".xlsx"
];
    const fileName = file.name.toLowerCase();

    const validFile = allowedExtensions.some(function (extension) {
        return fileName.endsWith(extension);
    });

    if (!validFile) {
        uploadMessage.textContent =
            "Allowed files: PDF, DOCX, TXT, JPG, PNG, PPT, XLS and XLSX.";
        return;
    }

    if (documents.some(function (doc) {
        return doc.name === file.name;
    })) {
        uploadMessage.textContent = "This file is already in the list.";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    uploadBtn.disabled = true;
    uploadMessage.textContent = "Uploading document...";

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/api/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Upload failed.");
        }

        documents.push({
            name: result.filename,
            size: file.size
        });

        updateDocumentList();
        uploadMessage.textContent = result.message;
        fileInput.value = "";

    } catch (error) {
        uploadMessage.textContent =
            "Upload failed: " + error.message;
    } finally {
        uploadBtn.disabled = false;
    }
});

function updateDocumentList() {
    documentList.replaceChildren();

    documents.forEach(function (doc, index) {
        const item = document.createElement("div");
        const name = document.createElement("span");
        const removeBtn = document.createElement("button");

        name.textContent = doc.name;
        removeBtn.textContent = "Remove";
        removeBtn.type = "button";

        removeBtn.addEventListener("click", async function () {
    const confirmed = confirm(
        "Are you sure you want to delete " + doc.name + "?"
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/api/documents/" +
            encodeURIComponent(doc.name),
            { method: "DELETE" }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Delete failed.");
        }

        documents = documents.filter(function (item) {
            return item.name !== doc.name;
        });

        updateDocumentList();
        uploadMessage.textContent = result.message;

    } catch (error) {
        uploadMessage.textContent =
            "Delete failed: " + error.message;
    }
});

        item.append(name, document.createTextNode(" "), removeBtn);
        documentList.appendChild(item);
    });

    documentCount.textContent = documents.length;
}

searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const query = searchInput.value.trim();
    searchResults.replaceChildren();

    if (!query) {
        searchResults.textContent = "Please enter a search keyword.";
        return;
    }

    searchResults.textContent = "Searching documents...";

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/api/search?q=" +
            encodeURIComponent(query)
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Search failed.");
        }

        searchResults.replaceChildren();

        if (data.results.length === 0) {
            searchResults.textContent =
                "No matching document content found.";
            return;
        }

        data.results.forEach(function (doc) {
            const result = document.createElement("p");
            result.textContent = doc.filename;
            searchResults.appendChild(result);
        });

    } catch (error) {
        searchResults.textContent =
            "Search failed: " + error.message;
    }
});
/* Website AI Assistant */

const aiToggle = document.getElementById("aiToggle");
const aiChat = document.getElementById("aiChat");
const aiClose = document.getElementById("aiClose") ||
               document.getElementById("aiclose");
const aiForm = document.getElementById("aiForm");
const aiInput = document.getElementById("aiInput");
const aiMessages = document.getElementById("aiMessages");

aiToggle.addEventListener("click", function () {
    aiChat.hidden = !aiChat.hidden;
});

aiClose.addEventListener("click", function () {
    aiChat.hidden = true;
});

aiForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const question = aiInput.value.trim();

    if (!question) return;

    const userMessage = document.createElement("p");
    userMessage.textContent = "You: " + question;
    aiMessages.appendChild(userMessage);

    const answer = document.createElement("p");
    const text = question.toLowerCase();

    if (text.includes("upload") || text.includes("file")) {
    answer.textContent =
        "Assistant: Open Documents, choose a PDF, DOCX, or TXT file, and click Upload Document. Keep the backend running while uploading.";

} else if (text.includes("search") || text.includes("find")) {
    answer.textContent =
        "Assistant: Open Document Search, enter a keyword found inside your document, and click Search. Only supported documents with matching text will appear.";

} else if (text.includes("login") || text.includes("sign in")) {
    answer.textContent =
        "Assistant: Enter your email and password on the login page. This demo currently checks that both fields are filled; it does not verify a real account.";

} else if (text.includes("logout") || text.includes("log out")) {
    answer.textContent =
        "Assistant: Click Log Out in the sidebar to return to the login page.";

} else if (text.includes("document")) {
    answer.textContent =
        "Assistant: Open Documents to view, upload, or remove supported files. Your uploaded files are stored by the backend.";

} else if (text.includes("dashboard")) {
    answer.textContent =
        "Assistant: Click Dashboard in the sidebar to return to the main dashboard.";

} else if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    answer.textContent =
        "Assistant: Hello! How can I help you with the Secure Document Portal today?";

} else if (text.includes("help")) {
    answer.textContent =
        "Assistant: I can guide you with login, uploading documents, searching file contents, removing documents, and using the dashboard.";

} else {
    answer.textContent =
        "Assistant: I can help with login, uploads, document search, removing files, and dashboard navigation. Try asking about one of these features.";
}

    aiMessages.appendChild(answer);
    aiInput.value = "";
    aiMessages.scrollTop = aiMessages.scrollHeight;
});