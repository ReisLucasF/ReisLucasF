// Estatísticas reais do GitHub (GraphQL). Na Action, o GITHUB_TOKEN padrão basta.
// Sem token, usa o último resultado salvo em data/github.json; sem ele, dados de exemplo.
import fs from 'node:fs';

const QUERY = `query($login: String!) {
  user(login: $login) {
    createdAt
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, first: 100, orderBy: { field: STARGAZERS, direction: DESC }) {
      totalCount
      nodes { stargazerCount languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } } }
    }
    contributionsCollection {
      totalCommitContributions totalPullRequestContributions totalIssueContributions totalPullRequestReviewContributions restrictedContributionsCount
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } }
    }
  }
}`;

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

function summarize(u) {
  const repos = u.repositories.nodes;
  const langs = {};
  for (const r of repos) for (const e of r.languages.edges) {
    const l = (langs[e.node.name] ||= { name: e.node.name, color: e.node.color || '#a1a1aa', size: 0 });
    l.size += e.size;
  }
  const total = Object.values(langs).reduce((a, l) => a + l.size, 0) || 1;
  const top = Object.values(langs).sort((a, b) => b.size - a.size).slice(0, 6).map(l => ({ ...l, pct: l.size / total }));
  const cc = u.contributionsCollection;
  const weeks = cc.contributionCalendar.weeks.map(w => w.contributionDays.map(d => ({ date: d.date, n: d.contributionCount, lv: LEVEL[d.contributionLevel] ?? 0 })));
  const days = weeks.flat();
  // sequência atual (hoje sem contribuição ainda não quebra) e maior sequência do ano
  let cur = 0, best = 0, run = 0;
  days.forEach(d => { run = d.n > 0 ? run + 1 : 0; best = Math.max(best, run); });
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].n > 0) cur++;
    else if (i === days.length - 1) continue;
    else break;
  }
  return {
    sample: false,
    fetchedAt: new Date().toISOString(),
    since: u.createdAt,
    followers: u.followers.totalCount,
    repos: u.repositories.totalCount,
    stars: repos.reduce((a, r) => a + r.stargazerCount, 0),
    commits: cc.totalCommitContributions + cc.restrictedContributionsCount,
    prs: cc.totalPullRequestContributions,
    reviews: cc.totalPullRequestReviewContributions,
    issues: cc.totalIssueContributions,
    contributions: cc.contributionCalendar.totalContributions,
    streak: cur, bestStreak: best,
    langs: top, weeks,
  };
}

function sample() {
  // forma plausível só para pré-visualização local; a Action troca pelos dados reais
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const start = new Date(); start.setDate(start.getDate() - 364 - start.getDay());
  const weeks = [];
  for (let w = 0; w < 53; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d);
      if (dt > new Date()) break;
      const busy = d > 0 && d < 6 ? 0.78 : 0.3, n = rnd() < busy ? Math.ceil(rnd() ** 2 * 14) : 0;
      days.push({ date: dt.toISOString().slice(0, 10), n, lv: n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 10 ? 3 : 4 });
    }
    weeks.push(days);
  }
  return {
    sample: true, fetchedAt: null, followers: 0, repos: 12, stars: 20, commits: 900, prs: 60, reviews: 40, issues: 10, contributions: 1100, streak: 9, bestStreak: 31,
    langs: [
      { name: 'TypeScript', color: '#3178c6', pct: 0.42 }, { name: 'JavaScript', color: '#f1e05a', pct: 0.2 }, { name: 'Dart', color: '#00B4AB', pct: 0.14 },
      { name: 'Python', color: '#3572A5', pct: 0.1 }, { name: 'C#', color: '#178600', pct: 0.08 }, { name: 'CSS', color: '#663399', pct: 0.06 },
    ],
    weeks,
  };
}

export async function githubStats(login, cacheFile) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) {
    try {
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'lr-os-readme' },
        body: JSON.stringify({ query: QUERY, variables: { login } }),
      });
      const json = await res.json();
      if (!res.ok || json.errors || !json.data?.user) throw new Error(JSON.stringify(json.errors || json.message || res.status));
      const s = summarize(json.data.user);
      fs.writeFileSync(cacheFile, JSON.stringify(s));
      return s;
    } catch (e) {
      console.warn('GitHub API falhou, usando cache:', e.message);
    }
  }
  if (fs.existsSync(cacheFile)) return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  console.warn('sem GITHUB_TOKEN e sem cache: usando dados de exemplo no card de estatísticas');
  return sample();
}
