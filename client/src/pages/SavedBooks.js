import React from 'react';
import {
	Jumbotron,
	Container,
	CardColumns,
	Card,
	Button,
} from 'react-bootstrap';

import { Redirect } from 'react-router-dom';

import { useQuery, useMutation } from '@apollo/react-hooks';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
	const { loading, data, error } = useQuery(GET_ME);
	const [deleteBook] = useMutation(REMOVE_BOOK);
	const userData = data?.me || {};

	if (error) {
		alert(error.message);
		return <Redirect to='/' />;
	}

	// create function that accepts the book's mongo _id value as param and deletes the book from the database
	const handleDeleteBook = async (bookId) => {
		try {
			await deleteBook({
				variables: { bookId },
			});

			// remove book's id from localStorage
			removeBookId(bookId);
		} catch (err) {
			console.error(err);
		}
	};

	// if data isn't here yet, say so
	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<Jumbotron fluid className='text-light bg-dark'>
				<Container>
					<h1>Viewing saved books!</h1>
				</Container>
			</Jumbotron>
			<Container>
				<h2>
					{userData.savedBooks.length
						? `Viewing ${userData.savedBooks.length} saved ${
								userData.savedBooks.length === 1
									? 'book'
									: 'books'
						  }:`
						: 'You have no saved books!'}
				</h2>
				<CardColumns>
					{userData.savedBooks.map((book) => {
						return (
							<Card key={book.bookId} border='dark'>
								<a href={book.link} target='_blank' rel="noopener noreferrer">
									{book.image ? (
										<Card.Img
											src={book.image}
											alt={`The cover for ${book.title}`}
											variant='top'
										/>
									) : null}
								</a>
								<Card.Body>
									<a href={book.link} target='_blank' rel="noopener noreferrer">
										<Card.Title>{book.title}</Card.Title>
									</a>
									<p className='small'>
										Authors: {book.authors}
									</p>
									<Card.Text>{book.description}</Card.Text>
									<Button
										className='btn-block btn-danger'
										onClick={() =>
											handleDeleteBook(book.bookId)
										}
									>
										Delete this Book!
									</Button>
								</Card.Body>
							</Card>
						);
					})}
				</CardColumns>
			</Container>
		</>
	);
};

export default SavedBooks;
