import ky from "ky";
import cnsl from "#/lib/cnsl";
import type { GitHubRepoResponse, PackageInfo, StarCache } from "#types";

const BASE_NPM_URL = "https://registry.npmjs.org/";
const BASE_GH_URL = "https://api.github.com";

const starCache: StarCache = {};

export async function getGitHubStars(packageName: string): Promise<string> {
  if (starCache[packageName]) {
    return starCache[packageName];
  }

  try {
    const packageInfo = await ky
      .get(`${BASE_NPM_URL}/${packageName}`)
      .json<PackageInfo>();

    let repositoryUrl: string = packageInfo.repository?.url || "";

    repositoryUrl = repositoryUrl.replace(/\.git$/, "");

    const repoMatch = repositoryUrl.match(/github\.com\/([^/]+)\/([^/]+)$/);

    if (repoMatch?.[1] && repoMatch[2]) {
      const owner = repoMatch[1];
      const repo = repoMatch[2];

      const response = await ky
        .get(`${BASE_GH_URL}/repos/${owner}/${repo}`)
        .json<GitHubRepoResponse>();

      const stars = response.stargazers_count;
      const result = `${stars} ${cnsl.yellowGreen("★ stars")}`;

      starCache[packageName] = result;

      return result;
    }
    return "";
  } catch {
    return "NA";
  }
}
