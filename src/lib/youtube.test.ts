import assert from "node:assert/strict";
import { test } from "node:test";
import { youtubeId } from "./youtube.ts";

test("youtubeId", () => {
  const id = "dQw4w9WgXcQ";
  for (const u of [
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtube.com/watch?v=${id}&t=42s`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?si=abc`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
    ` https://www.youtube.com/live/${id} `,
  ]) assert.equal(youtubeId(u), id, u);
  for (const u of ["", "not a url", "https://vimeo.com/123", `https://evil.com/watch?v=${id}`, "https://youtu.be/short"])
    assert.equal(youtubeId(u), null, u);
});
