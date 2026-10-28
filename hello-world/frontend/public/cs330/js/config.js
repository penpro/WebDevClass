/* Global config: units, check-in ranges, defaults, question classification.
   Works in browser (window) and Node (globalThis) for testing. */
(function (root) {
  var CS = (root.CS = root.CS || {});

  // The course's 52 cards come in runs of four (what / syntax / syntax / fluency),
  // so a "unit" is one run. Gated progression follows the course's own card order.
  CS.UNITS = [
    { n: 1,  cards: [1, 4],   title: "Course Overview",           blurb: "Schema vs CRUD, entities and relationships, knowledge vs practical skills." },
    { n: 2,  cards: [5, 8],   title: "Tables & Queries",          blurb: "Tables, rows, columns, primary keys; SELECT, WHERE, ORDER BY, LIMIT." },
    { n: 3,  cards: [9, 12],  title: "Relationships & Foreign Keys", blurb: "Has-many / belongs-to, FOREIGN KEY, inserting related rows." },
    { n: 4,  cards: [13, 16], title: "JOINs",                     blurb: "INNER JOIN, LEFT JOIN, aliases, finding unmatched rows." },
    { n: 5,  cards: [17, 20], title: "Normalization & Anomalies", blurb: "Redundancy, update / delete anomalies, splitting a flat table." },
    { n: 6,  cards: [21, 24], title: "Normal Forms & Many-to-Many", blurb: "1NF / 2NF / 3NF, junction tables, many-to-many queries." },
    { n: 7,  cards: [25, 28], title: "Keys & Constraints",        blurb: "PRIMARY KEY, composite keys, UNIQUE, NOT NULL, DEFAULT, CHECK." },
    { n: 8,  cards: [29, 32], title: "INSERT / UPDATE / DELETE",  blurb: "Changing data safely, the WHERE habit, event-log tables." },
    { n: 9,  cards: [33, 36], title: "GROUP BY & HAVING",         blurb: "Aggregates, grouping, HAVING vs WHERE, order of execution." },
    { n: 10, cards: [37, 40], title: "Subqueries & Set Operations", blurb: "IN / NOT IN, correlated subqueries, UNION, INTERSECT, EXCEPT." },
    { n: 11, cards: [41, 44], title: "Document & Key-Value Stores", blurb: "Documents, embedding, Mongo-style queries, key-value caching." },
    { n: 12, cards: [45, 48], title: "Graph Databases",           blurb: "Nodes, edges, Cypher-style patterns, multi-hop traversal." },
    { n: 13, cards: [49, 52], title: "Apps & Choosing a Database", blurb: "Connections, parameterized queries, SQL injection, picking a store." }
  ];
  CS.UNITS.forEach(function (u) { u.short = "Unit " + u.n; });

  CS.unitOfCard = function (card) {
    for (var i = 0; i < CS.UNITS.length; i++) {
      if (card >= CS.UNITS[i].cards[0] && card <= CS.UNITS[i].cards[1]) return CS.UNITS[i].n;
    }
    return CS.UNITS[CS.UNITS.length - 1].n;
  };
  CS.unitMeta = function (n) {
    return CS.UNITS.find(function (u) { return u.n === n; }) || { n: n, short: "Unit " + n, title: "Unit " + n, blurb: "", cards: [0, 0] };
  };

  // The course's own check-ins name these card ranges (checkin-1: cards 1-12,
  // checkin-2: cards 1-36, check-ins 3-5: all 52). Selecting one serves every
  // question in range, ignoring gating and the ramp, like the real check-in would.
  CS.CHECKPOINTS = [
    { id: "ci1", title: "Check-in 1", cards: [1, 12],  blurb: "Cards 1–12: tables, SELECT / WHERE / ORDER BY / LIMIT, foreign keys." },
    { id: "ci2", title: "Check-in 2", cards: [1, 36],  blurb: "Cards 1–36: everything through GROUP BY / HAVING." },
    { id: "all", title: "Check-ins 3–5", cards: [1, 52], blurb: "All 52 cards." }
  ];
  CS.checkpoint = function (id) { return CS.CHECKPOINTS.find(function (c) { return c.id === id; }) || null; };

  CS.DEFAULTS = {
    masterStreak: 3,        // self-graded "got it" answers in a row to master a question
    unlockThreshold: 0.9,   // unit mastery needed to unlock the next unit
    mode: "guided",         // "guided" (gated) | "free" (all units open)
    ramp: true,             // ease in: concept -> syntax -> trace -> write -> debug -> design
    theme: "dark"
  };

  CS.RAMP_THRESHOLD = 0.7;
  CS.INTERVALS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32 };

  // ---- classification (from each question's tags) --------------------------
  var TYPE_RANK = { conceptual: 0, syntax_pattern: 10, tracing: 20, writing_prompt: 30, debugging: 35, design: 40 };
  var TYPE_LABEL = { conceptual: "Concept", syntax_pattern: "Syntax", tracing: "Trace", writing_prompt: "Write", debugging: "Debug", design: "Design" };
  CS.TYPE_RANK = TYPE_RANK; CS.TYPE_LABEL = TYPE_LABEL;

  CS.typeOf = function (q) {
    var t = (q.tags || []).filter(function (x) { return TYPE_RANK[x] != null; });
    return t.length ? t[0] : "conceptual";
  };
  CS.rankOf = function (q) { return q.rank != null ? q.rank : TYPE_RANK[CS.typeOf(q)]; };
  CS.rankLabel = function (r) {
    if (r <= 0) return "Concept";
    if (r <= 10) return "Syntax";
    if (r <= 20) return "Trace";
    if (r <= 30) return "Write";
    if (r <= 35) return "Debug";
    return "Design";
  };
  CS.tierClass = function (r) { return r <= 0 ? 0 : r < 30 ? 1 : r < 40 ? 2 : 3; };

  // Topic = the most specific concept / operation tag, used for "weakest topics"
  // and topic drills. Order matters: first match wins.
  var TOPIC_ORDER = ["security", "app_architecture", "anomaly", "normalization", "constraint", "key",
    "inner_join", "left_join", "join", "er_modeling", "relationship", "having", "group_by", "aggregate",
    "subquery", "set_operation", "order_by", "limit", "where", "insert", "update", "delete",
    "create_table", "select", "table", "graph_db", "document_db", "key_value", "relational"];
  var TOPIC_LABEL = {
    security: "Security / SQL injection", app_architecture: "App architecture", anomaly: "Anomalies",
    normalization: "Normalization", constraint: "Constraints", key: "Keys", er_modeling: "ER modeling",
    relationship: "Relationships", inner_join: "INNER JOIN", left_join: "LEFT JOIN", having: "HAVING",
    group_by: "GROUP BY", aggregate: "Aggregates", subquery: "Subqueries", set_operation: "UNION / INTERSECT / EXCEPT",
    order_by: "ORDER BY", limit: "LIMIT", join: "JOINs (general)", where: "WHERE", insert: "INSERT", update: "UPDATE",
    delete: "DELETE", create_table: "CREATE TABLE", select: "SELECT", table: "Tables & rows",
    graph_db: "Graph databases", document_db: "Document databases", key_value: "Key-value stores", relational: "Relational basics",
    general: "General"
  };
  // tiny topics fold into their parent so the weakest-topics list isn't noisy
  var TOPIC_ALIAS = { limit: "order_by", update: "insert", delete: "insert", create_table: "table" };
  TOPIC_LABEL.order_by = "ORDER BY / LIMIT";
  TOPIC_LABEL.insert = "INSERT / UPDATE / DELETE";
  TOPIC_LABEL.table = "Tables & CREATE TABLE";
  TOPIC_LABEL.db_types = "Database types & choosing one";
  var DB_TYPE_TAGS = ["relational", "document_db", "key_value", "graph_db"];
  CS.topicOf = function (q) {
    var tags = q.tags || [];
    // a question about several database kinds is about comparing/choosing them
    if (DB_TYPE_TAGS.filter(function (x) { return tags.indexOf(x) !== -1; }).length >= 2) return "db_types";
    for (var i = 0; i < TOPIC_ORDER.length; i++) {
      if (tags.indexOf(TOPIC_ORDER[i]) !== -1) return TOPIC_ALIAS[TOPIC_ORDER[i]] || TOPIC_ORDER[i];
    }
    return "general";
  };
  CS.topicLabel = function (t) { return TOPIC_LABEL[t] || t; };

  // ---- the bank ------------------------------------------------------------
  // Every question is "typed" (write it out, then self-grade) unless an authored
  // choice entry exists for its id (js/questions/choices-*.js), in which case it is
  // multiple choice ("mc", one right option) or select-all ("multi", 2+ right options)
  // and is graded automatically. Questions whose answer is code stay typed.
  CS.BANK = [];
  CS.CHOICES = {};
  CS.addQuestions = function (list) {
    list.forEach(function (q) {
      q.unit = CS.unitOfCard(q.card);
      q.type = CS.typeOf(q);
      q.rank = TYPE_RANK[q.type];
      q.topic = CS.topicOf(q);
      q.fmt = "typed";
      CS.BANK.push(q);
    });
  };
  CS.addChoices = function (map) {
    Object.keys(map).forEach(function (id) {
      CS.CHOICES[id] = map[id];
      var q = CS.BANK.find(function (x) { return x.id === id; });
      if (q) q.fmt = map[id].r.length > 1 ? "multi" : "mc";
    });
  };
  CS.FMT_LABEL = { typed: "Write it out", mc: "Multiple choice", multi: "Select all" };
  // the prompt actually shown (choice entries may reword it to suit options)
  CS.promptOf = function (q) { return (q.fmt !== "typed" && CS.CHOICES[q.id] && CS.CHOICES[q.id].p) || q.prompt; };

  // The suit badge the course uses for a card number (card N = rank ceil(N/4), suit cycles).
  CS.cardBadge = function (n) {
    var suits = ["♠", "♥", "♦", "♣"];
    var rank = Math.floor((n - 1) / 4) + 1;
    var label = { 1: "A", 11: "J", 12: "Q", 13: "K" }[rank] || String(rank);
    var suit = suits[(n - 1) % 4];
    return { text: label + " " + suit, red: suit === "♥" || suit === "♦" };
  };
})(typeof window !== "undefined" ? window : globalThis);
