/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { PointIntersection, SegmentIntersection } from "./geometry";
import { boundingBox, segmentIntersectsSegment } from "./geometry";
import { vec2 } from "./math";
import { line } from "./line";

describe("boundingBox", () => {
  it("returns an empty bounding box at (0, 0) if there are no vertices", () => {
    const l = line();
    const bb = boundingBox(l);
    expect(bb.topLeft).toEqual(vec2(0, 0));
    expect(bb.bottomRight).toEqual(vec2(0, 0));
    expect(bb.size).toEqual(vec2(0, 0));
    expect(bb.center).toEqual(vec2(0, 0));
  });

  it("returns a bounding box if there are vertices", () => {
    const l = line(vec2(0, 0), vec2(10, 4), vec2(-4, 8));
    const bb = boundingBox(l);
    expect(bb.topLeft).toEqual(vec2(-4, 0));
    expect(bb.bottomRight).toEqual(vec2(10, 8));
    expect(bb.size).toEqual(vec2(14, 8));
    expect(bb.center).toEqual(vec2(3, 4));
  });
});

describe("segmentIntersectsSegment", () => {
  it("finds point intersections", () => {
    const intersection = segmentIntersectsSegment(
      vec2(0, 0),
      vec2(1, 1),
      vec2(0, 1),
      vec2(1, 0)
    );
    expect(intersection).toBeTruthy();
    expect(intersection!.type).toEqual("point");
    expect((intersection! as PointIntersection).point).toEqual(vec2(0.5, 0.5));
  });

  it("finds point intersections at the start of the first segment", () => {
    const intersection = segmentIntersectsSegment(
      vec2(0, 0),
      vec2(0, 1),
      vec2(-1, 0),
      vec2(1, 0)
    );
    expect(intersection).toBeTruthy();
    expect(intersection!.type).toEqual("point");
    expect((intersection! as PointIntersection).point).toEqual(vec2(0, 0));
  });

  it("finds point intersections at the end of the first segment", () => {
    const intersection = segmentIntersectsSegment(
      vec2(0, 0),
      vec2(0, 1),
      vec2(-1, 1),
      vec2(1, 1)
    );
    expect(intersection).toBeTruthy();
    expect(intersection!.type).toEqual("point");
    expect((intersection! as PointIntersection).point).toEqual(vec2(0, 1));
  });

  it("finds point intersections at the start of the second segment", () => {
    const intersection = segmentIntersectsSegment(
      vec2(-1, 0),
      vec2(1, 0),
      vec2(0, 0),
      vec2(0, 1)
    );
    expect(intersection).toBeTruthy();
    expect(intersection!.type).toEqual("point");
    expect((intersection! as PointIntersection).point).toEqual(vec2(0, 0));
  });

  it("finds point intersections at the end of the second segment", () => {
    const intersection = segmentIntersectsSegment(
      vec2(-1, 1),
      vec2(1, 1),
      vec2(0, 0),
      vec2(0, 1)
    );
    expect(intersection).toBeTruthy();
    expect(intersection!.type).toEqual("point");
    expect((intersection! as PointIntersection).point).toEqual(vec2(0, 1));
  });

  it("finds segment intersections where the first segment completely overlaps the second", () => {
    const intersection = segmentIntersectsSegment(
      vec2(0, 0),
      vec2(10, 10),
      vec2(3, 3),
      vec2(5, 5)
    );
    expect(intersection).toBeTruthy();
    expect(intersection!.type).toEqual("segment");
    expect((intersection! as SegmentIntersection).start).toEqual(vec2(3, 3));
    expect((intersection! as SegmentIntersection).end).toEqual(vec2(5, 5));
  });

  it("finds segment intersections where b the second segment completely overlaps the first", () => {
    const intersection = segmentIntersectsSegment(
      vec2(3, 3),
      vec2(5, 5),
      vec2(0, 0),
      vec2(10, 10)
    );
    expect(intersection).toBeTruthy();
    expect(intersection!.type).toEqual("segment");
    expect((intersection! as SegmentIntersection).start).toEqual(vec2(3, 3));
    expect((intersection! as SegmentIntersection).end).toEqual(vec2(5, 5));
  });

  it("finds segment intersections where the segments partially overlap", () => {
    const intersection = segmentIntersectsSegment(
      vec2(0, 0),
      vec2(5, 5),
      vec2(3, 3),
      vec2(10, 10)
    );
    expect(intersection).toBeTruthy();
    expect(intersection!.type).toEqual("segment");
    expect((intersection! as SegmentIntersection).start).toEqual(vec2(3, 3));
    expect((intersection! as SegmentIntersection).end).toEqual(vec2(5, 5));
  });

  it("returns null when there is no intersection between non-collinear segments", () => {
    const intersection = segmentIntersectsSegment(
      vec2(0, 0),
      vec2(10, 10),
      vec2(3, 4),
      vec2(3, 7)
    );
    expect(intersection).toBeNull();

  });

  it("returns null when there is no intersection between collinear segments", () => {
    const intersection = segmentIntersectsSegment(
      vec2(0, 0),
      vec2(3, 3),
      vec2(5, 5),
      vec2(10, 10)
    );
    expect(intersection).toBeNull();
  });
});
