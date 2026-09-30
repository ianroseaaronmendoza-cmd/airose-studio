import React from "react";
import books from "../../../public/data/books.json";
import BookCard from "../../components/portfolio/BookCard";
import PageIntro from "../../components/portfolio/PageIntro";
export default function BooksPage() {
  return (
    <div className="studio-container">
      <PageIntro
        eyebrow="01 / Books & Stories"
        title="A world between the pages."
      >
        <p>Published books and freely shared stories by Ian Mendoza.</p>
      </PageIntro>
      <div className="studio-books">
        {books.map((book) => (
          <BookCard key={book.slug} book={book} />
        ))}
      </div>
    </div>
  );
}
