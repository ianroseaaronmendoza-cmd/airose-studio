import React from "react";
import { Link } from "react-router-dom";
import books from "../../../public/data/books.json";
export type Book = (typeof books)[number];
export default function BookCard({ book }: { book: Book }) {
  return (
    <article className="studio-book" id={book.slug}>
      <div className="studio-book-art">
        {book.cover ? (
          <img src={book.cover} alt={book.title + " cover"} loading="lazy" />
        ) : (
          <div className="studio-type-cover">
            <span>IAN MENDOZA</span>
            <strong>{book.title}</strong>
            <span>PAPERBACK · AVAILABLE ON AMAZON</span>
          </div>
        )}
      </div>
      <div className="studio-book-copy">
        <p className="studio-eyebrow">
          {book.type}
          <span> / </span>
          {book.availability === "free" ? "Free to read" : "Published book"}
        </p>
        <h2>{book.title}</h2>
        <p className="studio-author">By {book.author}</p>
        <p>{book.description}</p>
        {book.availability === "free" && book.readerUrl ? (
          <>
            <Link className="studio-button" to={book.readerUrl}>
              Read free on this site →
            </Link>
            <a
              className="studio-reader-link"
              href={book.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {book.externalLinkIsProfile
                ? "Also on Wattpad · author’s profile"
                : "Also read on Wattpad"}{" "}
              ↗
            </a>
          </>
        ) : (
          <a
            className="studio-text-link"
            href={book.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy paperback on Amazon ↗
          </a>
        )}
      </div>
    </article>
  );
}
