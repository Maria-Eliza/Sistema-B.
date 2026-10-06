```javascript
/* =========================================================
   BIBLIOTECA AURORA
   Sistema front-end
   Armazenamento temporário: localStorage
   ========================================================= */


/* ================= BANCO TEMPORÁRIO ================= */

const STORAGE = {
    books: "aurora_books",
    users: "aurora_users",
    loans: "aurora_loans",
    favorites: "aurora_favorites"
};


let books = JSON.parse(localStorage.getItem(STORAGE.books)) || [];
let users = JSON.parse(localStorage.getItem(STORAGE.users)) || [];
let loans = JSON.parse(localStorage.getItem(STORAGE.loans)) || [];
let favorites = JSON.parse(localStorage.getItem(STORAGE.favorites)) || [];


/* ================= ELEMENTOS ================= */

const pages = document.querySelectorAll(".page");
const menuItems = document.querySelectorAll(".menu-item[data-page]");
const breadcrumbTitle = document.getElementById("breadcrumbTitle");


/* ================= INICIALIZAÇÃO ================= */

document.addEventListener("DOMContentLoaded", () => {

    setDefaultDates();

    renderAll();

    setupNavigation();

    setupForms();

    setupSearch();

    setupModals();

    setupTheme();

});


/* ================= NAVEGAÇÃO ================= */

function setupNavigation() {

    menuItems.forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            navigate(page);

        });

    });


    document.querySelectorAll("[data-page-link]").forEach(button => {

        button.addEventListener("click", () => {

            navigate(button.dataset.pageLink);

        });

    });


    document.getElementById("mobileMenu").addEventListener("click", () => {

        document.getElementById("sidebar").classList.toggle("open");

    });

}


function navigate(pageName) {

    pages.forEach(page => {

        page.classList.remove("active");

    });


    const selectedPage = document.getElementById(`page-${pageName}`);

    if (!selectedPage) return;

    selectedPage.classList.add("active");


    menuItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );

    });


    const titles = {
        home: "Início",
        catalog: "Acervo",
        favorites: "Minha lista",
        books: "Cadastro de livros",
        users: "Usuários",
        loans: "Empréstimos",
        history: "Histórico"
    };


    breadcrumbTitle.textContent =
        titles[pageName] || "Biblioteca";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    document.getElementById("sidebar").classList.remove("open");


    if (pageName === "catalog") {
        renderCatalog();
    }

    if (pageName === "favorites") {
        renderFavorites();
    }

    if (pageName === "books") {
        renderBooksTable();
    }

    if (pageName === "users") {
        renderUsersTable();
    }

    if (pageName === "loans") {
        populateLoanSelects();
    }

    if (pageName === "history") {
        renderLoansTable();
    }

}


/* ================= RENDER GERAL ================= */

function renderAll() {

    renderStats();

    renderHomeBooks();

    renderRecentLoans();

    renderCatalog();

    renderFavorites();

    renderBooksTable();

    renderUsersTable();

    populateLoanSelects();

    renderLoansTable();

}


/* ================= ESTATÍSTICAS ================= */

function renderStats() {

    const totalBooks = books.reduce(
        (total, book) => total + Number(book.quantity),
        0
    );


    const openLoans = loans.filter(
        loan => loan.status === "open"
    ).length;


    const returnedLoans = loans.filter(
        loan => loan.status === "returned"
    ).length;


    document.getElementById("statBooks").textContent =
        totalBooks;


    document.getElementById("statUsers").textContent =
        users.length;


    document.getElementById("statOpenLoans").textContent =
        openLoans;


    document.getElementById("statReturned").textContent =
        returnedLoans;

}


/* ================= DISPONIBILIDADE ================= */

function getAvailable(bookId) {

    const book = books.find(
        item => String(item.id) === String(bookId)
    );


    if (!book) return 0;


    const borrowed = loans.filter(
        loan =>
            String(loan.bookId) === String(bookId) &&
            loan.status === "open"
    ).length;


    return Math.max(
        0,
        Number(book.quantity) - borrowed
    );

}


/* ================= LIVROS ================= */

function renderHomeBooks() {

    const container =
        document.getElementById("homeBookGrid");


    const list = books.slice(0, 5);


    if (!list.length) {

        container.innerHTML = emptyState(
            "Nenhum livro cadastrado",
            "Cadastre o primeiro livro para começar."
        );

        return;

    }


    container.innerHTML =
        list.map(createBookCard).join("");

}


function renderCatalog() {

    const container =
        document.getElementById("catalogGrid");


    let list = [...books];


    const search =
        document.getElementById("catalogSearch")?.value
            .toLowerCase()
            .trim();


    const category =
        document.getElementById("categoryFilter")?.value;


    const sort =
        document.getElementById("sortBooks")?.value;


    if (search) {

        list = list.filter(book =>
            book.title.toLowerCase().includes(search) ||
            book.author.toLowerCase().includes(search)
        );

    }


    if (category) {

        list = list.filter(
            book => book.category === category
        );

    }


    if (sort === "title") {

        list.sort((a, b) =>
            a.title.localeCompare(b.title)
        );

    }


    if (sort === "author") {

        list.sort((a, b) =>
            a.author.localeCompare(b.author)
        );

    }


    if (sort === "recent") {

        list.sort((a, b) =>
            b.createdAt - a.createdAt
        );

    }


    document.getElementById("catalogResult").textContent =
        `${list.length} ${list.length === 1 ? "livro encontrado" : "livros encontrados"}`;


    if (!list.length) {

        container.innerHTML = emptyState(
            "Nenhum livro encontrado",
            "Tente outro termo ou categoria."
        );

        return;

    }


    container.innerHTML =
        list.map(createBookCard).join("");

}


function createBookCard(book) {

    const available = getAvailable(book.id);

    const isFavorite =
        favorites.includes(book.id);


    return `
        <article class="book-card">

            <button
                class="favorite ${isFavorite ? "active" : ""}"
                onclick="toggleFavorite(${book.id})"
                title="Adicionar à minha lista"
            >
                ${isFavorite ? "♥" : "♡"}
            </button>

            <div class="cover">

                <small>${escapeHTML(book.category)}</small>

                <strong>
                    ${escapeHTML(book.title)}
                </strong>

            </div>

            <div class="book-info">

                <h3>
                    ${escapeHTML(book.title)}
                </h3>

                <p>
                    ${escapeHTML(book.author)}
                </p>

                <div class="book-meta">

                    <span class="category">
                        ${escapeHTML(book.category)}
                    </span>

                    <span class="available">
                        ${available > 0
                            ? `${available} disponível${available > 1 ? "is" : ""}`
                            : "Indisponível"
                        }
                    </span>

                </div>

            </div>

        </article>
    `;

}


/* ================= FAVORITOS ================= */

function toggleFavorite(id) {

    if (favorites.includes(id)) {

        favorites = favorites.filter(
            favoriteId => favoriteId !== id
        );

        showToast("Livro removido da sua lista.");

    } else {

        favorites.push(id);

        showToast("Livro adicionado à sua lista.");

    }


    saveFavorites();

    renderCatalog();

    renderHomeBooks();

    renderFavorites();

}


function renderFavorites() {

    const container =
        document.getElementById("favoritesGrid");


    const list =
        books.filter(book => favorites.includes(book.id));


    if (!list.length) {

        container.innerHTML = emptyState(
            "Sua lista está vazia",
            "Clique no coração de um livro para salvá-lo."
        );

        return;

    }


    container.innerHTML =
        list.map(createBookCard).join("");

}


/* ================= CADASTRO DE LIVROS ================= */

function setupForms() {

    document
        .getElementById("bookForm")
        .addEventListener("submit", event => {

            event.preventDefault();


            const title =
                document.getElementById("bookTitle").value.trim();


            const author =
                document.getElementById("bookAuthor").value.trim();


            const category =
                document.getElementById("bookCategory").value;


            const quantity =
                Number(document.getElementById("bookQuantity").value);


            if (!title || !author || !category || quantity < 1) {

                showToast(
                    "Preencha todos os campos corretamente.",
                    "error"
                );

                return;

            }


            books.push({

                id: Date.now(),

                title,

                author,

                category,

                quantity,

                createdAt: Date.now()

            });


            saveBooks();


            event.target.reset();

            document.getElementById("bookQuantity").value = 1;


            closeModal("bookModal");


            renderAll();


            showToast("Livro cadastrado com sucesso.");

        });


    /* USUÁRIO */

    document
        .getElementById("userForm")
        .addEventListener("submit", event => {

            event.preventDefault();


            const name =
                document.getElementById("userName").value.trim();


            const email =
                document.getElementById("userEmail").value.trim();


            const phone =
                document.getElementById("userPhone").value.trim();


            if (!name || !email) {

                showToast(
                    "Preencha nome e e-mail.",
                    "error"
                );

                return;

            }


            users.push({

                id: Date.now(),

                name,

                email,

                phone,

                createdAt: Date.now()

            });


            saveUsers();


            event.target.reset();


            closeModal("userModal");


            renderAll();


            showToast("Usuário cadastrado com sucesso.");

        });


    /* EMPRÉSTIMO */

    document
        .getElementById("loanForm")
        .addEventListener("submit", createLoan);

}


/* ================= CRIAR EMPRÉSTIMO ================= */

function createLoan(event) {

    event.preventDefault();


    const bookId =
        Number(document.getElementById("loanBook").value);


    const userId =
        Number(document.getElementById("loanUser").value);


    const loanDate =
        document.getElementById("loanDate").value;


    const dueDate =
        document.getElementById("dueDate").value;


    if (!bookId || !userId || !loanDate || !dueDate) {

        showToast(
            "Preencha todos os campos.",
            "error"
        );

        return;

    }


    if (dueDate < loanDate) {

        showToast(
            "A devolução não pode ser anterior ao empréstimo.",
            "error"
        );

        return;

    }


    if (getAvailable(bookId) <= 0) {

        showToast(
            "Este livro não possui exemplares disponíveis.",
            "error"
        );

        populateLoanSelects();

        return;

    }


    loans.push({

        id: Date.now(),

        bookId,

        userId,

        loanDate,

        dueDate,

        returnDate: null,

        status: "open"

    });


    saveLoans();


    event.target.reset();


    setDefaultDates();


    renderAll();


    showToast("Empréstimo registrado com sucesso.");

}


/* ================= SELECTS ================= */

function populateLoanSelects() {

    const bookSelect =
        document.getElementById("loanBook");


    const userSelect =
        document.getElementById("loanUser");


    if (!bookSelect || !userSelect) return;


    const currentBook =
        bookSelect.value;


    const currentUser =
        userSelect.value;


    bookSelect.innerHTML = `
        <option value="">
            Selecione um livro
        </option>
    `;


    books.forEach(book => {

        const available =
            getAvailable(book.id);


        if (available > 0) {

            const option =
                document.createElement("option");


            option.value = book.id;

            option.textContent =
                `${book.title} — ${available} disponível${available > 1 ? "is" : ""}`;


            bookSelect.appendChild(option);

        }

    });


    userSelect.innerHTML = `
        <option value="">
            Selecione um usuário
        </option>
    `;


    users.forEach(user => {

        const option =
            document.createElement("option");


        option.value = user.id;

        option.textContent = user.name;


        userSelect.appendChild(option);

    });


    if (
        [...bookSelect.options]
            .some(option => option.value === currentBook)
    ) {

        bookSelect.value = currentBook;

    }


    if (
        [...userSelect.options]
            .some(option => option.value === currentUser)
    ) {

        userSelect.value = currentUser;

    }

}


/* ================= DEVOLVER ================= */

function returnLoan(id) {

    const loan =
        loans.find(item => item.id === id);


    if (!loan || loan.status === "returned") return;


    loan.status = "returned";


    loan.returnDate =
        new Date().toISOString().split("T")[0];


    saveLoans();


    renderAll();


    showToast("Livro marcado como devolvido.");

}


/* ================= TABELA DE LIVROS ================= */

function renderBooksTable() {

    const tbody =
        document.getElementById("booksTable");


    if (!tbody) return;


    const search =
        document.getElementById("bookManagementSearch")
            ?.value
            .toLowerCase()
            .trim();


    let list = [...books];


    if (search) {

        list = list.filter(book =>
            book.title.toLowerCase().includes(search) ||
            book.author.toLowerCase().includes(search)
        );

    }


    if (!list.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    Nenhum livro encontrado.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML = list.map(book => {

        const available =
            getAvailable(book.id);


        return `
            <tr>

                <td>
                    <strong>
                        ${escapeHTML(book.title)}
                    </strong>

                    <small>
                        ID #${book.id}
                    </small>
                </td>

                <td>
                    ${escapeHTML(book.author)}
                </td>

                <td>
                    <span class="category">
                        ${escapeHTML(book.category)}
                    </span>
                </td>

                <td>
                    ${book.quantity}
                </td>

                <td>
                    <strong>
                        ${available}
                    </strong>
                </td>

                <td>

                    <div class="table-actions">

                        <button
                            class="table-btn delete"
                            onclick="deleteBook(${book.id})"
                        >
                            Excluir
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");

}


/* ================= EXCLUIR LIVRO ================= */

function deleteBook(id) {

    const hasLoan =
        loans.some(
            loan =>
                loan.bookId === id &&
                loan.status === "open"
        );


    if (hasLoan) {

        showToast(
            "Não é possível excluir um livro emprestado.",
            "error"
        );

        return;

    }


    const book =
        books.find(item => item.id === id);


    if (!book) return;


    if (
        !confirm(
            `Deseja excluir "${book.title}"?`
        )
    ) return;


    books =
        books.filter(item => item.id !== id);


    favorites =
        favorites.filter(item => item !== id);


    saveBooks();

    saveFavorites();


    renderAll();


    showToast("Livro excluído.");

}


/* ================= TABELA DE USUÁRIOS ================= */

function renderUsersTable() {

    const tbody =
        document.getElementById("usersTable");


    if (!tbody) return;


    const search =
        document.getElementById("userSearch")
            ?.value
            .toLowerCase()
            .trim();


    let list = [...users];


    if (search) {

        list = list.filter(user =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        );

    }


    if (!list.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    Nenhum usuário encontrado.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML = list.map(user => {

        const userLoans =
            loans.filter(
                loan => loan.userId === user.id
            ).length;


        return `
            <tr>

                <td>

                    <div style="display:flex;align-items:center;gap:9px">

                        <div class="avatar">
                            ${escapeHTML(user.name.charAt(0).toUpperCase())}
                        </div>

                        <strong>
                            ${escapeHTML(user.name)}
                        </strong>

                    </div>

                </td>

                <td>
                    ${escapeHTML(user.email)}
                </td>

                <td>
                    ${escapeHTML(user.phone || "—")}
                </td>

                <td>
                    ${userLoans}
                </td>

                <td>

                    <div class="table-actions">

                        <button
                            class="table-btn delete"
                            onclick="deleteUser(${user.id})"
                        >
                            Excluir
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");

}


/* ================= EXCLUIR USUÁRIO ================= */

function deleteUser(id) {

    const hasOpenLoan =
        loans.some(
            loan =>
                loan.userId === id &&
                loan.status === "open"
        );


    if (hasOpenLoan) {

        showToast(
            "Este usuário possui um empréstimo aberto.",
            "error"
        );

        return;

    }


    const user =
        users.find(item => item.id === id);


    if (!user) return;


    if (
        !confirm(
            `Deseja excluir "${user.name}"?`
        )
    ) return;


    users =
        users.filter(item => item.id !== id);


    saveUsers();


    renderAll();


    showToast("Usuário excluído.");

}


/* ================= HISTÓRICO ================= */

function renderLoansTable() {

    const tbody =
        document.getElementById("loansTable");


    if (!tbody) return;


    const search =
        document.getElementById("loanSearch")
            ?.value
            .toLowerCase()
            .trim();


    const status =
        document.getElementById("statusFilter")
            ?.value;


    let list = [...loans];


    if (search) {

        list = list.filter(loan => {

            const book =
                books.find(
                    item => item.id === loan.bookId
                );


            const user =
                users.find(
                    item => item.id === loan.userId
                );


            return (
                book?.title.toLowerCase().includes(search) ||
                book?.author.toLowerCase().includes(search) ||
                user?.name.toLowerCase().includes(search)
            );

        });

    }


    if (status) {

        list =
            list.filter(
                loan => loan.status === status
            );

    }


    list.sort(
        (a, b) => b.id - a.id
    );


    if (!list.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    Nenhum empréstimo encontrado.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML = list.map(loan => {

        const book =
            books.find(
                item => item.id === loan.bookId
            );


        const user =
            users.find(
                item => item.id === loan.userId
            );


        return `
            <tr>

                <td>

                    <strong>
                        ${escapeHTML(book?.title || "Livro removido")}
                    </strong>

                    <small>
                        ${escapeHTML(book?.author || "—")}
                    </small>

                </td>


                <td>
                    ${escapeHTML(user?.name || "Usuário removido")}
                </td>


                <td>
                    ${formatDate(loan.loanDate)}
                </td>


                <td>

                    ${
                        loan.status === "returned"
                            ? formatDate(loan.returnDate)
                            : formatDate(loan.dueDate)
                    }

                </td>


                <td>

                    <span class="status ${loan.status}">

                        ${
                            loan.status === "open"
                                ? "Em aberto"
                                : "Devolvido"
                        }

                    </span>

                </td>


                <td>

                    ${
                        loan.status === "open"

                        ? `
                            <button
                                class="table-btn"
                                onclick="returnLoan(${loan.id})"
                            >
                                Devolver
                            </button>
                        `

                        : `
                            <span style="color:var(--muted);font-size:10px">
                                Concluído
                            </span>
                        `
                    }

                </td>

            </tr>
        `;

    }).join("");

}


/* ================= EMPRÉSTIMOS RECENTES ================= */

function renderRecentLoans() {

    const container =
        document.getElementById("recentLoans");


    const recent =
        [...loans]
            .sort((a,b) => b.id - a.id)
            .slice(0, 5);


    if (!recent.length) {

        container.innerHTML = `
            <div style="padding:25px 0;color:var(--muted);font-size:11px">
                Nenhum empréstimo registrado ainda.
            </div>
        `;

        return;

    }


    container.innerHTML =
        recent.map(loan => {

            const book =
                books.find(
                    item => item.id === loan.bookId
                );


            const user =
                users.find(
                    item => item.id === loan.userId
                );


            return `
                <div class="loan-row">

                    <div class="loan-book">

                        <strong>
                            ${escapeHTML(book?.title || "Livro removido")}
                        </strong>

                        <small>
                            ${escapeHTML(book?.author || "—")}
                        </small>

                    </div>


                    <div class="loan-user">

                        <strong>
                            ${escapeHTML(user?.name || "Usuário removido")}
                        </strong>

                        <small>
                            ${formatDate(loan.loanDate)}
                        </small>

                    </div>


                    <div>

                        <span class="status ${loan.status}">
                            ${
                                loan.status === "open"
                                    ? "Em aberto"
                                    : "Devolvido"
                            }
                        </span>

                    </div>

                </div>
            `;

        }).join("");

}


/* ================= PESQUISA ================= */

function setupSearch() {

    const homeSearch =
        document.getElementById("homeSearch");


    document
        .getElementById("homeSearchBtn")
        .addEventListener("click", () => {

            const value =
                homeSearch.value.trim();


            navigate("catalog");


            setTimeout(() => {

                const input =
                    document.getElementById("catalogSearch");


                input.value = value;

                renderCatalog();

            }, 50);

        });


    homeSearch.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                document
                    .getElementById("homeSearchBtn")
                    .click();

            }

        }
    );


    document
        .getElementById("catalogSearch")
        .addEventListener(
            "input",
            renderCatalog
        );


    document
        .getElementById("categoryFilter")
        .addEventListener(
            "change",
            renderCatalog
        );


    document
        .getElementById("sortBooks")
        .addEventListener(
            "change",
            renderCatalog
        );


    document
        .getElementById("bookManagementSearch")
        .addEventListener(
            "input",
            renderBooksTable
        );


    document
        .getElementById("userSearch")
        .addEventListener(
            "input",
            renderUsersTable
        );


    document
        .getElementById("loanSearch")
        .addEventListener(
            "input",
            renderLoansTable
        );


    document
        .getElementById("statusFilter")
        .addEventListener(
            "change",
            renderLoansTable
        );

}


/* ================= MODAIS ================= */

function setupModals() {

    document
        .getElementById("openBookModal")
        .addEventListener(
            "click",
            () => openModal("bookModal")
        );


    document
        .getElementById("openUserModal")
        .addEventListener(
            "click",
            () => openModal("userModal")
        );


    document
        .querySelectorAll("[data-close]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => closeModal(button.dataset.close)
            );

        });


    document
        .querySelectorAll(".modal-overlay")
        .forEach(overlay => {

            overlay.addEventListener(
                "click",
                event => {

                    if (event.target === overlay) {

                        overlay.classList.remove("show");

                    }

                }
            );

        });

}


function openModal(id) {

    document
        .getElementById(id)
        .classList.add("show");

}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("show");

}


/* ================= TEMA ================= */

function setupTheme() {

    const savedTheme =
        localStorage.getItem("aurora_theme");


    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        document.getElementById("themeIcon")
            .textContent = "☀";

    }


    document
        .getElementById("themeBtn")
        .addEventListener("click", () => {

            document.body.classList.toggle("dark");


            const dark =
                document.body.classList.contains("dark");


            localStorage.setItem(
                "aurora_theme",
                dark ? "dark" : "light"
            );


            document.getElementById("themeIcon")
                .textContent = dark ? "☀" : "☾";

        });

}


/* ================= ACESSIBILIDADE ================= */

function increaseFont() {

    const current =
        parseFloat(
            getComputedStyle(document.documentElement)
                .fontSize
        );


    document.documentElement.style.fontSize =
        `${Math.min(current + 1, 20)}px`;

}


function decreaseFont() {

    const current =
        parseFloat(
            getComputedStyle(document.documentElement)
                .fontSize
        );


    document.documentElement.style.fontSize =
        `${Math.max(current - 1, 13)}px`;

}


function toggleContrast() {

    document.body.classList.toggle("high-contrast");

}


/* ================= DATAS ================= */

function setDefaultDates() {

    const today =
        new Date().toISOString().split("T")[0];


    const loanDate =
        document.getElementById("loanDate");


    const dueDate =
        document.getElementById("dueDate");


    if (loanDate && !loanDate.value) {

        loanDate.value = today;

    }


    if (dueDate && !dueDate.value) {

        const date =
            new Date();


        date.setDate(
            date.getDate() + 7
        );


        dueDate.value =
            date.toISOString().split("T")[0];

    }

}


/* ================= FORMATAÇÃO ================= */

function formatDate(date) {

    if (!date) return "—";


    const [year, month, day] =
        date.split("-");


    return `${day}/${month}/${year}`;

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ================= ESTADO VAZIO ================= */

function emptyState(title, message) {

    return `
        <div
            style="
                grid-column:1/-1;
                padding:55px 20px;
                text-align:center;
                background:var(--surface);
                border:1px solid var(--border);
                border-radius:12px;
            "
        >

            <div
                style="
                    font-size:35px;
                    color:var(--primary);
                    margin-bottom:10px;
                "
            >
                ▤
            </div>

            <strong
                style="
                    display:block;
                    margin-bottom:5px;
                "
            >
                ${title}
            </strong>

            <span
                style="
                    color:var(--muted);
                    font-size:11px;
                "
            >
                ${message}
            </span>

        </div>
    `;

}


/* ================= TOAST ================= */

let toastTimer;


function showToast(message, type = "success") {

    const toast =
        document.getElementById("toast");


    const icon =
        document.getElementById("toastIcon");


    const text =
        document.getElementById("toastMessage");


    text.textContent = message;


    icon.textContent =
        type === "error" ? "!" : "✓";


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

}


/* ================= LOCAL STORAGE ================= */

function saveBooks() {

    localStorage.setItem(
        STORAGE.books,
        JSON.stringify(books)
    );

}


function saveUsers() {

    localStorage.setItem(
        STORAGE.users,
        JSON.stringify(users)
    );

}


function saveLoans() {

    localStorage.setItem(
        STORAGE.loans,
        JSON.stringify(loans)
    );

}


function saveFavorites() {

    localStorage.setItem(
        STORAGE.favorites,
        JSON.stringify(favorites)
    );

}


/* =========================================================
   DISPONIBILIZAR FUNÇÕES PARA OS BOTÕES HTML
   ========================================================= */

window.toggleFavorite = toggleFavorite;
window.returnLoan = returnLoan;
window.deleteBook = deleteBook;
window.deleteUser = deleteUser;
