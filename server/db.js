import { DatabaseSync } from 'node:sqlite';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, 'data');
const dbPath = path.join(dataDir, 'cuphead.sqlite');
const schemaPath = path.join(dataDir, 'schema.sql');
const legacyPath = path.join(dataDir, 'database.json');
fs.mkdirSync(dataDir, { recursive: true });
export const db = new DatabaseSync(dbPath);
db.exec(fs.readFileSync(schemaPath, 'utf8'));
function ensureColumn(table, column, definition) {
  try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`); } catch { /* existing database */ }
}
ensureColumn('users', 'first_name', "TEXT NOT NULL DEFAULT ''");
ensureColumn('users', 'last_name', "TEXT NOT NULL DEFAULT ''");
ensureColumn('users', 'grade', "TEXT NOT NULL DEFAULT ''");
ensureColumn('users', 'telegram_id', "TEXT NOT NULL DEFAULT ''");
ensureColumn('problems', 'examples_json', "TEXT NOT NULL DEFAULT '[]'");
ensureColumn('problems', 'url_key', "TEXT NOT NULL DEFAULT ''");
ensureColumn('problem_statements', 'input_markdown', "TEXT NOT NULL DEFAULT ''");
ensureColumn('problem_statements', 'output_markdown', "TEXT NOT NULL DEFAULT ''");
ensureColumn('lessons', 'piece', "TEXT NOT NULL DEFAULT 'pawn'");
ensureColumn('roadmap_modules', 'piece', "TEXT NOT NULL DEFAULT 'pawn'");
ensureColumn('problems', 'piece', "TEXT NOT NULL DEFAULT 'pawn'");
ensureColumn('contributor_requests', 'telegram_id', "TEXT NOT NULL DEFAULT ''");
ensureColumn('users', 'profile_image', "TEXT NOT NULL DEFAULT '/icon.png'");
ensureColumn('users', 'abilities_json', "TEXT NOT NULL DEFAULT '{}'");
ensureColumn('users', 'reviewer', "INTEGER NOT NULL DEFAULT 0");
ensureColumn('problems', 'usaco_level', "TEXT NOT NULL DEFAULT ''");
ensureColumn('problems', 'contest_year', 'INTEGER');
ensureColumn('problems', 'cses_topic', "TEXT NOT NULL DEFAULT ''");
ensureColumn('contributions', 'xp_awarded', "INTEGER NOT NULL DEFAULT 0");
ensureColumn('contributions', 'published_id', "TEXT NOT NULL DEFAULT ''");
ensureColumn('problem_submissions', 'review_note', "TEXT NOT NULL DEFAULT ''");
ensureColumn('problem_submissions', 'published_parts_json', "TEXT NOT NULL DEFAULT '{}'");

export const now = () => new Date().toISOString();
export const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
export function hashPassword(password, saltHex = crypto.randomBytes(16).toString('hex')) {
  return { passwordSalt: saltHex, passwordHash: crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64).toString('hex') };
}
export function verifyPassword(password, user) {
  try {
    const candidate = crypto.scryptSync(password, Buffer.from(user.password_salt, 'hex'), 64);
    const stored = Buffer.from(user.password_hash, 'hex');
    return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
  } catch { return false; }
}
export const all = (sql, params = {}) => db.prepare(sql).all(params);
export const one = (sql, params = {}) => db.prepare(sql).get(params);
export const run = (sql, params = {}) => db.prepare(sql).run(params);
db.exec(`CREATE TABLE IF NOT EXISTS problem_submissions (id TEXT PRIMARY KEY,problem_id TEXT NOT NULL UNIQUE REFERENCES problems(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,status TEXT NOT NULL DEFAULT 'pending',xp_awarded INTEGER NOT NULL DEFAULT 0,review_note TEXT NOT NULL DEFAULT '',published_parts_json TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL,reviewed_at TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY,actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,actor_username TEXT NOT NULL DEFAULT '',actor_role TEXT NOT NULL DEFAULT '',method TEXT NOT NULL,path TEXT NOT NULL,status_code INTEGER NOT NULL DEFAULT 200,summary TEXT NOT NULL DEFAULT '',metadata_json TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL)`);
db.exec(`CREATE TABLE IF NOT EXISTS xp_settings (key TEXT PRIMARY KEY,value INTEGER NOT NULL DEFAULT 0)`);
db.exec(`CREATE TABLE IF NOT EXISTS lesson_practice_items (id TEXT PRIMARY KEY,lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,name TEXT NOT NULL DEFAULT '',difficulty TEXT NOT NULL DEFAULT '',url TEXT NOT NULL DEFAULT '',position INTEGER NOT NULL DEFAULT 0)`);
[['statement',10],['hint',15],['solution',30],['takeaway',10],['problem',100]].forEach(([key,value])=>run(`INSERT OR IGNORE INTO xp_settings(key,value) VALUES (:key,:value)`,{key,value}));
run("UPDATE users SET role='user' WHERE role='editor'");
run("UPDATE users SET reviewer=1,role='admin' WHERE role='reviewer'");
run(`UPDATE lessons SET piece=CASE rank WHEN 'bronze' THEN 'pawn' WHEN 'silver' THEN 'bishop' WHEN 'gold' THEN 'queen' ELSE piece END WHERE piece='pawn'`);
run(`UPDATE roadmap_modules SET piece=CASE rank WHEN 'bronze' THEN 'pawn' WHEN 'silver' THEN 'bishop' WHEN 'gold' THEN 'queen' ELSE piece END WHERE piece='pawn'`);
run(`UPDATE problems SET piece=CASE rank WHEN 'bronze' THEN 'pawn' WHEN 'silver' THEN 'bishop' WHEN 'gold' THEN 'queen' ELSE piece END WHERE piece='pawn'`);
run("UPDATE problems SET url_key=slug WHERE url_key='' OR url_key IS NULL");
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_problem_source_url_key ON problems(source_id,url_key) WHERE url_key<>''");
export const json = (value, fallback = []) => { try { return JSON.parse(value || JSON.stringify(fallback)); } catch { return fallback; } };
export const defaultAdminAbilities = { manage_library:true, manage_lessons:true, manage_roadmap:true, review_contributions:true, review_problems:true, manage_files:true };

function publicUser(row) {
  return row && { id: row.id, username: row.username, email: row.email || '', displayName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.username, firstName: row.first_name || '', lastName: row.last_name || '', grade: row.grade || '', telegramId: row.telegram_id || '', profileImage: row.profile_image || '/icon.png', role: row.reviewer ? 'reviewer' : ['owner','admin'].includes(row.role)?row.role:'user', abilities: json(row.abilities_json, {}), bio: row.bio || '', createdAt: row.created_at };
}
export { publicUser };

const chessPieces = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
export const pieceFromRank = (value = '') => chessPieces.includes(value) ? value : ({ bronze:'pawn', silver:'bishop', gold:'queen' }[value] || 'pawn');
export const legacyRank = (value = '') => ({ pawn:'bronze', knight:'bronze', bishop:'silver', rook:'silver', queen:'gold', king:'gold' }[value] || (['bronze','silver','gold'].includes(value) ? value : 'bronze'));

function mapLesson(row) {
  if (!row) return null;
  return { id: row.id, slug: row.slug, title: row.title, summary: row.summary, section: row.section, rank: pieceFromRank(row.piece || row.rank), difficulty: row.difficulty, status: row.status, contentMarkdown: row.content_markdown, practice: all(`SELECT name, difficulty, url FROM lesson_practice_items WHERE lesson_id=:id ORDER BY position`, { id: row.id }).map(x => ({ name: x.name, difficulty: x.difficulty, url: x.url })), createdAt: row.created_at, updatedAt: row.updated_at };
}
function mapProblem(row, userId = null) {
  if (!row) return null;
  const solved = userId ? Boolean(one(`SELECT solved FROM progress WHERE user_id=:userId AND problem_id=:id`, { userId, id: row.id })?.solved) : false;
  const examples = json(row.examples_json).map((example) => ({ ...example, input: String(example.input || '').replaceAll('\\n', '\n'), output: String(example.output || '').replaceAll('\\n', '\n'), explanation: String(example.explanation || '').replaceAll('\\n', '\n') }));
  return { id: row.id, slug: row.slug, urlKey: row.url_key || row.slug, source: { id: row.source_id, name: row.source_name, slug: row.source_slug, url: row.source_url, color: row.brand_color }, externalId: row.external_id, name: row.name, topic: row.topic, rating: row.rating, sourceMeta: { usacoLevel: row.usaco_level || '', contestYear: row.contest_year || null, csesTopic: row.cses_topic || '' }, tags: json(row.tags_json), link: row.link, examples, statementDefaultLanguage: row.statement_default_language, solved };
}
export { mapLesson, mapProblem };

function seedFromLegacy() {
  if (one('SELECT COUNT(*) AS count FROM users').count > 0 || !fs.existsSync(legacyPath)) return;
  const legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
  db.exec('BEGIN');
  try {
    for (const u of legacy.users || []) run(`INSERT INTO users (id,username,display_name,role,password_salt,password_hash,created_at,updated_at) VALUES (:id,:username,:displayName,:role,:salt,:hash,:createdAt,:createdAt)`, { id: u.id, username: u.username, displayName: u.displayName, role: u.role === 'owner' ? 'owner' : u.role || 'admin', salt: u.passwordSalt, hash: u.passwordHash, createdAt: u.createdAt || now() });
    for (const lesson of legacy.lessons || []) {
      run(`INSERT INTO lessons (id,slug,title,summary,section,rank,difficulty,status,content_markdown,created_at,updated_at) VALUES (:id,:slug,:title,:summary,:section,:rank,:difficulty,:status,:content,:createdAt,:updatedAt)`, { id: lesson.id, slug: lesson.slug, title: lesson.title, summary: lesson.summary, section: lesson.section, rank: lesson.rank, difficulty: lesson.difficulty, status: lesson.status, content: lesson.contentMarkdown, createdAt: lesson.createdAt || now(), updatedAt: lesson.updatedAt || now() });
    }
    for (const [section, ranks] of Object.entries(legacy.roadmap || {})) for (const [rank, modules] of Object.entries(ranks)) (modules || []).forEach((mod, position) => { run(`INSERT INTO roadmap_modules (id,section,rank,title,description,position) VALUES (:id,:section,:rank,:title,:description,:position)`, { id: mod.id, section, rank, title: mod.title, description: mod.description, position }); (mod.lessonIds || []).forEach((lessonId, p) => run(`INSERT OR IGNORE INTO roadmap_module_lessons (module_id,lesson_id,position) VALUES (:moduleId,:lessonId,:position)`, { moduleId: mod.id, lessonId, position: p })); });
    for (const f of legacy.files || []) run(`INSERT INTO files (id,original_name,stored_name,url,size,mimetype,uploaded_at) VALUES (:id,:originalName,:storedName,:url,:size,:mimetype,:uploadedAt)`, { ...f, originalName: f.originalName, storedName: f.storedName, uploadedAt: f.uploadedAt });
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}

function seedNewContent() {
  if (one('SELECT COUNT(*) AS count FROM problem_sources').count > 0) return;
  const owner = one(`SELECT id FROM users WHERE role='owner' LIMIT 1`)?.id;
  const stamp = now();
  if (!owner) {
    const pass = hashPassword('cuphead123');
    run(`INSERT INTO users (id,username,display_name,role,password_salt,password_hash,created_at,updated_at) VALUES ('user-owner','admin','Headmaster CupHead','owner',:salt,:hash,:stamp,:stamp)`, { salt: pass.passwordSalt, hash: pass.passwordHash, stamp });
  }
  const admin = one(`SELECT id FROM users WHERE role='owner' LIMIT 1`).id;
  const headPass = hashPassword('headadmin123');
  run(`INSERT OR IGNORE INTO users (id,username,display_name,role,password_salt,password_hash,created_at,updated_at) VALUES ('user-headadmin','headadmin','CupHead Admin','admin',:salt,:hash,:stamp,:stamp)`, { salt: headPass.passwordSalt, hash: headPass.passwordHash, stamp });
  const samplePass = hashPassword('sample123');
  run(`INSERT OR IGNORE INTO users (id,username,email,display_name,first_name,last_name,grade,role,password_salt,password_hash,created_at,updated_at) VALUES ('user-sample','sampleuser','sample@cuphead.local','کاربر نمونه','کاربر','نمونه','پایه دهم','user',:salt,:hash,:stamp,:stamp)`, { salt: samplePass.passwordSalt, hash: samplePass.passwordHash, stamp });
  const sources = [
    ['src-cf','Codeforces','codeforces','https://codeforces.com','#60a5fa'],
    ['src-usaco','USACO','usaco','https://usaco.org','#fbbf24'],
    ['src-cses','CSES','cses','https://cses.fi','#a78bfa'],
    ['src-coci','COCI','coci','https://hsin.hr/coci/','#34d399'],
    ['src-atcoder','AtCoder','atcoder','https://atcoder.jp','#f472b6'],
  ];
  for (const [id,name,slug,url,color] of sources) run(`INSERT INTO problem_sources (id,name,slug,url,brand_color) VALUES (:id,:name,:slug,:url,:color)`, { id, name, slug, url, color });
  const problems = [
    { id:'problem-watermelon', slug:'watermelon', source:'src-cf', externalId:'4A', name:'Watermelon', summary:'تشخیص زوج بودن وزن هندوانه و امکان تقسیم آن به دو بخش مثبت.', topic:'مبانی و شرط‌ها', difficulty:'آسان', rank:'bronze', rating:800, tags:['implementation','math'], link:'https://codeforces.com/problemset/problem/4/A' },
    { id:'problem-weird-algorithm', slug:'weird-algorithm', source:'src-cses', externalId:'1068', name:'Weird Algorithm', summary:'دنباله‌ی کولاتز را تا رسیدن به یک دنبال کنید.', topic:'شبیه‌سازی', difficulty:'آسان', rank:'bronze', rating:null, tags:['simulation','math'], link:'https://cses.fi/problemset/task/1068/' },
    { id:'problem-two-sum', slug:'two-sum', source:'src-cf', externalId:'1741E', name:'Two Sum', summary:'برای هر مقدار، جفتی پیدا کنید که مجموع مشخصی دارد.', topic:'آرایه و map', difficulty:'متوسط', rank:'silver', rating:1100, tags:['arrays','hashing'], link:'https://codeforces.com/problemset/problem/1741/E' },
    { id:'problem-mixing-milk', slug:'mixing-milk', source:'src-usaco', externalId:'2020-January-Mixing Milk', name:'Mixing Milk', summary:'شبیه‌سازی ریختن شیر بین سطل‌ها در چند مرحله.', topic:'شبیه‌سازی', difficulty:'آسان', rank:'bronze', rating:null, tags:['simulation'], link:'https://usaco.org/index.php?page=jan20results' },
    { id:'problem-dynamic-range-sum', slug:'dynamic-range-sum', source:'src-cses', externalId:'1648', name:'Dynamic Range Sum Queries', summary:'به‌روزرسانی نقطه‌ای و پاسخ به مجموع بازه با Fenwick Tree.', topic:'ساختمان داده', difficulty:'سخت', rank:'gold', rating:null, tags:['data-structures','fenwick-tree'], link:'https://cses.fi/problemset/task/1648/' },
    { id:'problem-coci-greedy', slug:'coci-greedy-sample', source:'src-coci', externalId:'نمونه‌ی آموزشی', name:'سکه‌های هوشمند', summary:'یک مسئله‌ی نمونه برای تمرین نگاه حریصانه در مرحله‌ی اول.', topic:'حریصانه', difficulty:'متوسط', rank:'silver', rating:null, tags:['greedy','coci'], link:'https://hsin.hr/coci/' },
  ];
  for (const p of problems) run(`INSERT INTO problems (id,slug,source_id,external_id,name,summary,topic,difficulty,rank,rating,tags_json,link,status,created_by,created_at,updated_at) VALUES (:id,:slug,:source,:externalId,:name,:summary,:topic,:difficulty,:rank,:rating,:tags,:link,'published',:createdBy,:stamp,:stamp)`, { ...p, tags: JSON.stringify(p.tags), createdBy: admin, stamp });
  const statements = [
    ['problem-watermelon','fa','# هندوانه\n\nیک وزن `w` داریم. بررسی کنید آیا می‌توان آن را به دو بخش مثبت زوج تقسیم کرد یا نه.','published'],
    ['problem-watermelon','en','# Watermelon\n\nGiven a weight `w`, determine whether it can be split into two positive even parts.','published'],
    ['problem-weird-algorithm','fa','# الگوریتم عجیب\n\nبرای عدد `n`، اگر زوج است آن را نصف و اگر فرد است سه برابر به‌علاوه‌ی یک کنید تا به یک برسید. دنباله را چاپ کنید.','published'],
    ['problem-two-sum','fa','# دو جمع\n\nدر آرایه، دو اندیس متفاوت بیابید که مجموع مقادیرشان برابر هدف باشد.','published'],
    ['problem-mixing-milk','fa','# ترکیب شیر\n\nپس از مجموعه‌ای از انتقال‌ها بین سطل‌ها، مقدار شیر هر سطل را به دست آورید.','published'],
    ['problem-dynamic-range-sum','fa','# مجموع بازه‌ی پویا\n\nبه‌روزرسانی یک مقدار و پرس‌وجوی مجموع یک بازه را پشتیبانی کنید.','published'],
  ];
  statements.forEach(([problemId, language, content, status], i) => run(`INSERT INTO problem_statements (id,problem_id,language,content_markdown,status,author_id,created_at,updated_at) VALUES (:id,:problemId,:language,:content,:status,:authorId,:stamp,:stamp)`, { id: uid('statement') + i, problemId, language, content, status, authorId: admin, stamp }));
  const edu = [
    ['problem-watermelon','hint',1,'fa','به زوج یا فرد بودن وزن دقت کن.','','اگر w زوج باشد، هنوز باید هر دو قسمت مثبت باشند.'],
    ['problem-watermelon','hint',2,'fa','حالت‌های کوچک را بررسی کن.','','برای ۲، تقسیم به ۱ و ۱ مجاز نیست چون بخش‌ها زوج نیستند.'],
    ['problem-watermelon','solution',0,'fa','راه‌حل','','کافی است `w` زوج و بزرگ‌تر از ۲ باشد. پیچیدگی راه‌حل O(1) است.'],
    ['problem-watermelon','takeaway',0,'fa','نکته‌ی اصلی','','گاهی یک شرط مرزی کوچک، پاسخ مسئله را از یک تست زوج بودن ساده جدا می‌کند.'],
    ['problem-two-sum','hint',1,'fa','به دنبال مکمل بگرد.','','برای هر x، مقدار target - x را در یک map جست‌وجو کن.'],
    ['problem-two-sum','solution',0,'fa','راه‌حل با map','','با ذخیره‌ی مقادیر دیده‌شده، پاسخ در O(n) پیدا می‌شود.'],
    ['problem-dynamic-range-sum','hint',1,'fa','به عملیات update و query جدا فکر کن.','','Fenwick Tree هر دو عملیات را در O(log n) انجام می‌دهد.'],
    ['problem-dynamic-range-sum','takeaway',0,'fa','نکته‌ی اصلی','','ساختمان داده‌ی مناسب، پیاده‌سازی را ساده‌تر از نگه‌داشتن مجموع‌های دستی می‌کند.'],
  ];
  edu.forEach(([problemId,kind,layer,language,title,unused,content], i) => run(`INSERT INTO problem_education (id,problem_id,kind,layer,language,title,content_markdown,status,author_id,created_at,updated_at) VALUES (:id,:problemId,:kind,:layer,:language,:title,:content,'published',:authorId,:stamp,:stamp)`, { id: uid('edu') + i, problemId, kind, layer, language, title, content, authorId: admin, stamp }));
  run(`INSERT INTO contributor_requests (id,user_id,motivation,experience,telegram_id,status,created_at) VALUES ('request-sample','user-sample','نمونه‌ی اولیه برای تست پنل درخواست همکاری','نویسنده‌ی تمرین‌های الگوریتمی','@cuphead_sample','approved',:stamp)`, { stamp });
}

seedFromLegacy();
seedNewContent();
run(`INSERT OR IGNORE INTO problem_sources (id,name,slug,url,brand_color) VALUES ('src-coci','COCI','coci','https://hsin.hr/coci/','#34d399')`);
run(`INSERT OR IGNORE INTO problem_sources (id,name,slug,url,brand_color) VALUES ('src-atcoder','AtCoder','atcoder','https://atcoder.jp','#f472b6')`);
run(`UPDATE problems SET source_id='src-coci',slug='coci-greedy-sample',tags_json='["greedy","coci"]',link='https://hsin.hr/coci/' WHERE source_id='src-inoi'`);
run(`DELETE FROM problem_sources WHERE slug='inoi' AND NOT EXISTS (SELECT 1 FROM problems WHERE source_id=problem_sources.id)`);
run(`UPDATE problems SET usaco_level=CASE WHEN usaco_level='' THEN 'Bronze' ELSE usaco_level END WHERE source_id='src-usaco'`);
run(`UPDATE problems SET contest_year=COALESCE(contest_year,2024) WHERE source_id='src-coci'`);
run(`UPDATE problems SET cses_topic=CASE WHEN cses_topic='' THEN 'Sorting and Searching' ELSE cses_topic END WHERE source_id='src-cses'`);
const canonicalCodeforcesTags=['2-sat','binary search','bitmasks','brute force','chinese remainder theorem','combinatorics','constructive algorithms','data structures','dfs and similar','divide and conquer','dp','dsu','expression parsing','fft','flows','games','geometry','graph matchings','graphs','greedy','hashing','implementation','interactive','math','matrices','meet-in-the-middle','number theory','probabilities','schedules','shortest paths','sortings','string suffix structures','strings','ternary search','trees','two pointers'];
for(const row of all('SELECT id,tags_json FROM problems')){const tags=json(row.tags_json,[]).filter(tag=>canonicalCodeforcesTags.includes(tag)).slice(0,8);run('UPDATE problems SET tags_json=:tags WHERE id=:id',{id:row.id,tags:JSON.stringify(tags)})}
run(`UPDATE users SET abilities_json=:abilities WHERE role='admin' AND (abilities_json='' OR abilities_json IS NULL OR abilities_json='{}')`, { abilities: JSON.stringify(defaultAdminAbilities) });
run("UPDATE contributor_requests SET user_id=(SELECT id FROM users WHERE username='sampleuser'),telegram_id=COALESCE(NULLIF(telegram_id,''),'@cuphead_sample') WHERE id='request-sample' AND EXISTS (SELECT 1 FROM users WHERE username='sampleuser')");
const exampleSeeds = {
  'problem-watermelon': [{input:'8',output:'YES',explanation:'۸ را می‌توان به ۲ و ۶ تقسیم کرد.'},{input:'5',output:'NO',explanation:'وزن فرد است.'}],
  'problem-weird-algorithm': [{input:'3',output:'3 10 5 16 8 4 2 1',explanation:'دنباله با قوانین صورت مسئله ساخته می‌شود.'}],
  'problem-two-sum': [{input:'4 9\\n2 7 11 15',output:'1 2',explanation:'مقادیر ۲ و ۷ مجموع ۹ دارند.'}],
  'problem-mixing-milk': [{input:'3\\n10 3\\n11 4\\n12 5',output:'0 0 0',explanation:'نمونه‌ای کوتاه برای دنبال‌کردن انتقال‌ها.'}],
  'problem-dynamic-range-sum': [{input:'5 3\\n2 4 1 7 3\\n2 1 5',output:'17',explanation:'پرس‌وجوی اول مجموع کل آرایه است.'}],
  'problem-coci-greedy': [{input:'5\\n1 2 4 8 16',output:'31',explanation:'با انتخاب‌های متوالی به بهترین مجموع می‌رسیم.'}],
};
for (const [id, examples] of Object.entries(exampleSeeds)) run(`UPDATE problems SET examples_json=:examples WHERE id=:id AND (examples_json IS NULL OR examples_json='[]')`, { id, examples: JSON.stringify(examples) });
const statementIoSeeds = {
  'problem-watermelon': { input:'یک عدد صحیح w، وزن هندوانه.', output:'اگر بتوان وزن را به دو بخش مثبت زوج تقسیم کرد، YES و در غیر این صورت NO چاپ کنید.' },
  'problem-weird-algorithm': { input:'یک عدد صحیح n.', output:'تمام اعداد دنباله تا رسیدن به ۱ را چاپ کنید.' },
  'problem-two-sum': { input:'n، target و آرایه‌ی اعداد.', output:'دو اندیس با مجموع برابر target را چاپ کنید.' },
  'problem-mixing-milk': { input:'ظرف‌ها و مجموعه‌ی انتقال‌ها.', output:'مقدار نهایی شیر هر ظرف را چاپ کنید.' },
  'problem-dynamic-range-sum': { input:'n، تعداد عملیات و آرایه؛ سپس عملیات update یا query.', output:'برای هر query مجموع بازه را در یک خط چاپ کنید.' },
  'problem-coci-greedy': { input:'تعداد اعداد و خود اعداد.', output:'بهترین مجموع ممکن را چاپ کنید.' },
};
for (const [id, io] of Object.entries(statementIoSeeds)) run(`UPDATE problem_statements SET input_markdown=:input,output_markdown=:output WHERE problem_id=:id AND language='fa' AND (input_markdown='' OR output_markdown='')`, { id, input:io.input, output:io.output });
const collectionSeeds=[['collection-atcoder-dp','atcoder-dp-contest','AtCoder DP Contest','مجموعه رسمی مسائل DP Contest آت‌کدر.','src-atcoder'],['collection-cses-sorting','cses-sorting-searching','CSES Sorting and Searching','مسائل رسمی بخش مرتب‌سازی و جست‌وجو در CSES.','src-cses']];
for(const [id,slug,title,description,sourceId] of collectionSeeds)run(`INSERT OR IGNORE INTO problem_collections (id,slug,title,description,source_id,created_by,created_at,updated_at) VALUES (:id,:slug,:title,:description,:sourceId,:owner,:stamp,:stamp)`,{id,slug,title,description,sourceId,owner:one("SELECT id FROM users WHERE role='owner' LIMIT 1")?.id||null,stamp:now()});
run(`INSERT OR IGNORE INTO problem_collection_items (collection_id,problem_id,position) SELECT 'collection-cses-sorting','problem-dynamic-range-sum',0 WHERE EXISTS (SELECT 1 FROM problems WHERE id='problem-dynamic-range-sum')`);

export function roadmapObject() {
  const blank = () => ({ pawn:[], knight:[], bishop:[], rook:[], queen:[], king:[] });
  const output = { programming:blank(), algorithm:blank(), theory:blank() };
  const modules = all(`SELECT * FROM roadmap_modules ORDER BY section, rank, position`);
  for (const mod of modules) output[mod.section][pieceFromRank(mod.piece || mod.rank)].push({ id: mod.id, title: mod.title, description: mod.description, lessonIds: all(`SELECT lesson_id FROM roadmap_module_lessons WHERE module_id=:id ORDER BY position`, { id: mod.id }).map(x => x.lesson_id) });
  return output;
}

export function publicBootstrap(userId = null) {
  const user = userId && one('SELECT role, reviewer FROM users WHERE id=:id', { id: userId });
  const canSeeReview = Boolean(user && (['owner', 'admin'].includes(user.role) || user.reviewer));
  const lessonRows = all(`SELECT * FROM lessons WHERE status='published' OR (:canSeeReview=1 AND status='review') ORDER BY created_at`, { canSeeReview: canSeeReview ? 1 : 0 });
  const problemRows = all(`SELECT p.*, s.name AS source_name, s.slug AS source_slug, s.url AS source_url, s.brand_color FROM problems p JOIN problem_sources s ON s.id=p.source_id WHERE p.status='published' ORDER BY p.created_at DESC`);
  return { roadmap: roadmapObject(), lessons: lessonRows.map(mapLesson), problems: problemRows.map(x => mapProblem(x, userId)), sources: all(`SELECT * FROM problem_sources ORDER BY name`).map(x => ({ id:x.id,name:x.name,slug:x.slug,url:x.url,color:x.brand_color })) };
}
