import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

// The provider retired the `linkedin/web/*` namespace; live endpoints now run on
// `web_v2`, which is URL-native. These assert the wire format: public params are
// unchanged, `url` works anywhere, the params web_v2 dropped are gone, and the
// five retired endpoints are still callable so old code fails loudly at the API
// rather than with a TypeError.

describe("LinkedInNamespace", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 10 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function bodyOf() {
    const call = vi.mocked(fetch).mock.calls[0]!;
    return JSON.parse((call[1] as RequestInit).body as string);
  }

  function urlOf() {
    return vi.mocked(fetch).mock.calls[0]![0];
  }

  it("person posts a handle to /linkedin/person", async () => {
    await client.linkedin.person({ username: "williamhgates" });

    expect(bodyOf()).toEqual({ username: "williamhgates" });
    expect(urlOf()).toBe("https://api.scavio.dev/api/v1/linkedin/person");
  });

  it("accepts a full profile url instead of a handle", async () => {
    await client.linkedin.person({ url: "https://www.linkedin.com/in/williamhgates/" });

    expect(bodyOf()).toEqual({ url: "https://www.linkedin.com/in/williamhgates/" });
  });

  it("personAbout posts to /linkedin/person/about", async () => {
    await client.linkedin.personAbout({ username: "williamhgates" });

    expect(bodyOf()).toEqual({ username: "williamhgates" });
    expect(urlOf()).toBe("https://api.scavio.dev/api/v1/linkedin/person/about");
  });

  it("personPosts posts to /linkedin/person/posts", async () => {
    await client.linkedin.personPosts({ username: "williamhgates" });

    expect(bodyOf()).toEqual({ username: "williamhgates" });
    expect(urlOf()).toBe("https://api.scavio.dev/api/v1/linkedin/person/posts");
  });

  it("company posts a slug to /linkedin/company", async () => {
    await client.linkedin.company({ company: "microsoft" });

    expect(bodyOf()).toEqual({ company: "microsoft" });
    expect(urlOf()).toBe("https://api.scavio.dev/api/v1/linkedin/company");
  });

  it("companyPosts posts to /linkedin/company/posts", async () => {
    await client.linkedin.companyPosts({ company: "microsoft" });

    expect(bodyOf()).toEqual({ company: "microsoft" });
    expect(urlOf()).toBe("https://api.scavio.dev/api/v1/linkedin/company/posts");
  });

  it("searchJobs sends search and optional location", async () => {
    await client.linkedin.searchJobs({ search: "software engineer", location: "United States" });

    expect(bodyOf()).toEqual({ search: "software engineer", location: "United States" });
    expect(urlOf()).toBe("https://api.scavio.dev/api/v1/linkedin/search/jobs");
  });

  it("searchJobs works without a location", async () => {
    await client.linkedin.searchJobs({ search: "software engineer" });

    expect(bodyOf()).toEqual({ search: "software engineer" });
  });

  it("job posts job_id to /linkedin/job", async () => {
    await client.linkedin.job({ job_id: "4415427228" });

    expect(bodyOf()).toEqual({ job_id: "4415427228" });
    expect(urlOf()).toBe("https://api.scavio.dev/api/v1/linkedin/job");
  });

  it("post posts post_id to /linkedin/post", async () => {
    await client.linkedin.post({ post_id: "7488618410256523265" });

    expect(bodyOf()).toEqual({ post_id: "7488618410256523265" });
    expect(urlOf()).toBe("https://api.scavio.dev/api/v1/linkedin/post");
  });

  it("postComments sends a 1-based page", async () => {
    await client.linkedin.postComments({ post_id: "7488618410256523265", page: 2 });

    expect(bodyOf()).toEqual({ post_id: "7488618410256523265", page: 2 });
    expect(urlOf()).toBe("https://api.scavio.dev/api/v1/linkedin/post/comments");
  });

  describe("retired endpoints", () => {
    // Kept so existing code reaches the API and receives its 410 with a reason,
    // instead of dying on an undefined method.
    it.each([
      ["personContact", "person/contact"],
      ["companyPeople", "company/people"],
      ["companyJobs", "company/jobs"],
      ["searchPeople", "search/people"],
      ["searchPosts", "search/posts"],
    ])("%s still reaches /linkedin/%s", async (method, path) => {
      await (client.linkedin as any)[method]({});

      expect(urlOf()).toBe(`https://api.scavio.dev/api/v1/linkedin/${path}`);
    });
  });
});
