const SessionHandler = require("./session");
const ProfileHandler = require("./profile");
const BenefitsHandler = require("./benefits");
const ContributionsHandler = require("./contributions");
const AllocationsHandler = require("./allocations");
const MemosHandler = require("./memos");
const ResearchHandler = require("./research");
const tutorialRouter = require("./tutorial");
const ErrorHandler = require("./error").errorHandler;

const index = (app, db) => {

    "use strict";

    const sessionHandler = new SessionHandler(db);
    const profileHandler = new ProfileHandler(db);
    const benefitsHandler = new BenefitsHandler(db);
    const contributionsHandler = new ContributionsHandler(db);
    const allocationsHandler = new AllocationsHandler(db);
    const memosHandler = new MemosHandler(db);
    const researchHandler = new ResearchHandler(db);

    // Middleware to check if a user is logged in
    const isLoggedIn = sessionHandler.isLoggedInMiddleware;

    //Middleware to check if user has admin rights
    const isAdmin = sessionHandler.isAdminUserMiddleware;

    // The main page of the app
    app.get("/", sessionHandler.displayWelcomePage);

    // Login form
    app.get("/login", sessionHandler.displayLoginPage);
    app.post("/login", sessionHandler.handleLoginRequest);

    // Signup form
    app.get("/signup", sessionHandler.displaySignupPage);
    app.post("/signup", sessionHandler.handleSignup);

    // Logout page
    app.get("/logout", sessionHandler.displayLogoutPage);

    // The main page of the app
    app.get("/dashboard", isLoggedIn, sessionHandler.displayWelcomePage);

    // Profile page
    app.get("/profile", isLoggedIn, profileHandler.displayProfile);
    app.post("/profile", isLoggedIn, profileHandler.handleProfileUpdate);

    // Contributions Page
    app.get("/contributions", isLoggedIn, contributionsHandler.displayContributions);
    app.post("/contributions", isLoggedIn, contributionsHandler.handleContributionsUpdate);

    // FIX (A7): Enforce admin role for benefits management
    app.get("/benefits", isLoggedIn, isAdmin, benefitsHandler.displayBenefits);
    app.post("/benefits", isLoggedIn, isAdmin, benefitsHandler.updateBenefits);

    // Allocations Page
    // FIX (A1 Broken Access Control): prevent IDOR — user may only view own allocations
    app.get("/allocations/:userId", isLoggedIn, (req, res, next) => {
        if (parseInt(req.params.userId, 10) !== parseInt(req.session.userId, 10)) {
            return res.status(403).send("Forbidden: You can only view your own allocations.");
        }
        return allocationsHandler.displayAllocations(req, res, next);
    });

    // Memos Page
    app.get("/memos", isLoggedIn, memosHandler.displayMemos);
    app.post("/memos", isLoggedIn, memosHandler.addMemos);

    // Handle redirect for learning resources link
    // FIX (A10 Unvalidated Redirects): use literal-string redirects to avoid open redirect
    app.get("/learn", isLoggedIn, (req, res) => {
        const url = req.query.url;
        if (url === "/tutorial") {
            return res.redirect("/tutorial");
        }
        if (url === "https://nodegoat.herokuapp.com/tutorial") {
            return res.redirect("https://nodegoat.herokuapp.com/tutorial");
        }
        if (url === "https://www.owasp.org/index.php/OWASP_Node_js_Goat_Project") {
            return res.redirect("https://www.owasp.org/index.php/OWASP_Node_js_Goat_Project");
        }
        return res.redirect("/tutorial");
    });
    


    // Research Page
    app.get("/research", isLoggedIn, researchHandler.displayResearch);

    // Mount tutorial router
    app.use("/tutorial", tutorialRouter);

    // Error handling middleware
    app.use(ErrorHandler);
};

module.exports = index;
