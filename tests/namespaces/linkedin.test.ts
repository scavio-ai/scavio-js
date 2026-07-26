import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

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

  it("person posts username and include flags to /linkedin/person", async () => {
    await client.linkedin.person({
      username: "williamhgates",
      include_experiences: true,
      include_skills: false,
    });

    expect(bodyOf()).toEqual({
      username: "williamhgates",
      include_experiences: true,
      include_skills: false,
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/person",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("personAbout accepts urn or username", async () => {
    await client.linkedin.personAbout({ username: "williamhgates" });

    expect(bodyOf()).toEqual({ username: "williamhgates" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/person/about",
      expect.anything(),
    );
  });

  it("personPosts posts to /linkedin/person/posts", async () => {
    await client.linkedin.personPosts({ urn: "ACoAAA", cursor: "C" });

    expect(bodyOf()).toEqual({ urn: "ACoAAA", cursor: "C" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/person/posts",
      expect.anything(),
    );
  });

  it("personContact posts username to /linkedin/person/contact", async () => {
    await client.linkedin.personContact({ username: "williamhgates" });

    expect(bodyOf()).toEqual({ username: "williamhgates" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/person/contact",
      expect.anything(),
    );
  });

  it("company posts company to /linkedin/company", async () => {
    await client.linkedin.company({ company: "microsoft" });

    expect(bodyOf()).toEqual({ company: "microsoft" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/company",
      expect.anything(),
    );
  });

  it("companyPosts posts company/cursor/count to /linkedin/company/posts", async () => {
    await client.linkedin.companyPosts({ company: "microsoft", count: 50 });

    expect(bodyOf()).toEqual({ company: "microsoft", count: 50 });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/company/posts",
      expect.anything(),
    );
  });

  it("companyPeople accepts company_id or company", async () => {
    await client.linkedin.companyPeople({ company_id: "1035" });

    expect(bodyOf()).toEqual({ company_id: "1035" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/company/people",
      expect.anything(),
    );
  });

  it("companyJobs posts to /linkedin/company/jobs", async () => {
    await client.linkedin.companyJobs({ company: "microsoft" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/company/jobs",
      expect.anything(),
    );
  });

  it("searchPeople posts filters to /linkedin/search/people", async () => {
    await client.linkedin.searchPeople({ search: "john", title: "engineer" });

    expect(bodyOf()).toEqual({ search: "john", title: "engineer" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/search/people",
      expect.anything(),
    );
  });

  it("searchJobs posts search to /linkedin/search/jobs", async () => {
    await client.linkedin.searchJobs({
      search: "software engineer",
      remote: "true",
    });

    expect(bodyOf()).toEqual({ search: "software engineer", remote: "true" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/search/jobs",
      expect.anything(),
    );
  });

  it("searchPosts posts search to /linkedin/search/posts", async () => {
    await client.linkedin.searchPosts({ search: "AI agents" });

    expect(bodyOf()).toEqual({ search: "AI agents" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/search/posts",
      expect.anything(),
    );
  });

  it("job posts job_id to /linkedin/job", async () => {
    await client.linkedin.job({ job_id: "3900000000", include_skills: true });

    expect(bodyOf()).toEqual({ job_id: "3900000000", include_skills: true });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/job",
      expect.anything(),
    );
  });

  it("post posts post_id to /linkedin/post", async () => {
    await client.linkedin.post({ post_id: "7486820977411145728" });

    expect(bodyOf()).toEqual({ post_id: "7486820977411145728" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/post",
      expect.anything(),
    );
  });

  it("postComments posts to /linkedin/post/comments", async () => {
    await client.linkedin.postComments({
      post_id: "7486820977411145728",
      sort_order: "recent",
      post_type: "activity",
    });

    expect(bodyOf()).toEqual({
      post_id: "7486820977411145728",
      sort_order: "recent",
      post_type: "activity",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/linkedin/post/comments",
      expect.anything(),
    );
  });
});
