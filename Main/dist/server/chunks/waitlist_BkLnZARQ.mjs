import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import postgres from "postgres";
//#region src/lib/waitlist.ts
var MissingDatabaseUrlError = class extends Error {
	constructor() {
		super("DATABASE_URL is not configured.");
		this.name = "MissingDatabaseUrlError";
	}
};
var DuplicateWaitlistEmailError = class extends Error {
	constructor(email) {
		super(`A waitlist entry already exists for ${email}.`);
		this.name = "DuplicateWaitlistEmailError";
	}
};
function getSql() {
	throw new MissingDatabaseUrlError();
}
async function createWaitlistEntry(input) {
	const sql = getSql();
	try {
		const [entry] = await sql`
      insert into waitlist_entries (name, email)
      values (${input.name}, ${input.email})
      returning id, created_at
    `;
		return entry;
	} catch (error) {
		if (error instanceof postgres.PostgresError && error.code === "23505") throw new DuplicateWaitlistEmailError(input.email);
		throw error;
	}
}
//#endregion
//#region src/pages/api/waitlist.ts
var waitlist_exports = /* @__PURE__ */ __exportAll({
	ALL: () => ALL,
	POST: () => POST
});
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function jsonResponse(message, status) {
	return new Response(JSON.stringify({ message }), {
		status,
		headers: { "Content-Type": "application/json" }
	});
}
var POST = async ({ request }) => {
	let formData;
	try {
		formData = await request.formData();
	} catch {
		return jsonResponse("Submit the waitlist form with a valid name and email.", 400);
	}
	const name = String(formData.get("name") ?? "").trim();
	const email = String(formData.get("email") ?? "").trim().toLowerCase();
	if (!name) return jsonResponse("Please enter your name.", 400);
	if (!email) return jsonResponse("Please enter your email address.", 400);
	if (!EMAIL_PATTERN.test(email)) return jsonResponse("Please enter a valid email address.", 400);
	try {
		await createWaitlistEntry({
			name,
			email
		});
		return jsonResponse("You are on the waitlist. We will be in touch soon.", 201);
	} catch (error) {
		if (error instanceof DuplicateWaitlistEmailError) return jsonResponse("That email is already on the waitlist.", 409);
		if (error instanceof MissingDatabaseUrlError) {
			console.error(error.message);
			return jsonResponse("The waitlist is not configured yet. Add DATABASE_URL and try again.", 500);
		}
		console.error("Waitlist insert failed", error);
		return jsonResponse("Something went wrong while saving your request.", 500);
	}
};
var ALL = async () => new Response(JSON.stringify({ message: "Method not allowed." }), {
	status: 405,
	headers: {
		Allow: "POST",
		"Content-Type": "application/json"
	}
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/waitlist@_@ts
var page = () => waitlist_exports;
//#endregion
export { page };
