import React, { Component } from 'react';
import { judgeWinner, hasRoyalFlush, hasStraightFlush, hasFourOfAKind, hasFullHouse, hasFlush, hasStraight, hasThreeOfAKind, hasTwoPairs, hasPair, highestCard } from 'poker-hands';
import { suits, values } from "../utils";

import Layout from "./Layout";
import Deck from "./Deck";
import { Card, PlayerHand, Button, Footer, Alert, AlertClose } from "../Styles/Styled";

class App extends Component {
	constructor() {
		super();
		this.state = {
			alert: "",
			alertType: "",
			deck: [],
			selectedCards: {},
			players: []
		};
	};
	shuffleDeck = (deck) => {
		// for 1000 turns, switch the values of two random cards
		for (var i = 0; i < 1000; i++) {
			let location1 = Math.floor((Math.random() * deck.length));
			let location2 = Math.floor((Math.random() * deck.length));
			let temp = deck[location1];
			deck[location1] = deck[location2];
			deck[location2] = temp;
		}
		return deck
	};
	createDeckOfCards = () => {
		const cardList = [];
		for (let i in suits) {
			for (let j in values) {
				cardList.push(suits[i] + values[j])
			}
		}
		return this.shuffleDeck(cardList)
	};
	createHandOfCards = (deck) => {
		const hand = []
		for (let i = 1; i <= 5; i++) {
			const drawn = deck.pop();
			hand.push(drawn);
		}
		const result = {
			hand,
			deck
		}
		return result
	};
	componentDidMount() {
		//Setup the deck and the initial 2 player hands
		const deck = this.createDeckOfCards();
		const p1Draw = this.createHandOfCards(deck);
		const p2Draw = this.createHandOfCards(p1Draw.deck);
		const newdeck = p2Draw.deck;
		this.setState({deck: newdeck })
		this.setState({ players: 
			[
				{ name: "", cards: p1Draw.hand, edit: false }, 
				{ name: "", cards: p2Draw.hand, edit: false }
			]
		});
		//Record the list of cards that have been already used
		const cardList = p1Draw.hand.concat(p2Draw.hand);
		this.addSelectedCards(cardList);
	};
	addSelectedCards = (cards) => {
		const store = this.state.selectedCards;
		for (let i = 0; i <= cards.length; i++) {
			let card = cards[i]
			store[card] = true
		}
		this.setState({ selectedCards: store });
	};
	editName = (player) => {
		const key = player -1;
		const players = this.state.players;
		const temp = players[key];
		players[key] = {
			name: temp.name,
			edit: !temp.edit,
			cards: temp.cards
		}
		this.setState({ players })
	};
	onNameChange = (event,player) => {
		const name = event.target.value ? event.target.value : `Player ${player} name`
		const key = player -1;
		const players = this.state.players;
		const temp = players[key];
		players[key] = {
			name: name,
			edit: temp.edit,
			cards: temp.cards
		}
		this.setState({ players })
	};
	onKeyPress = (event,num) => {
	    if (event.which === 13) {
	      this.editName(num);
	    }
	  };
	removePlayer = (player) => {
		const key = player-1
		const players = this.state.players
		//Return the players cards to deck and shuffle
		const cards = players[key].cards
		const deck = this.state.deck
		const selection = this.state.selectedCards
		for (let i = 0;i <= cards.length;i++) {
			let card = cards[i]
			selection[card] = false
			deck.push(card)
		}
		const newdeck = this.shuffleDeck(deck)
		this.setState({ deck: newdeck });
		this.setState({ selectedCards: selection })
		//Delete the player
		const newlist = players.filter((item, index) => index !== key)
		this.setState({ players: newlist })
	};
	addPlayer = () => {
		if (this.state.players.length >= 6) { 
			this.setState({ alert: "Oops! Grabyo Poker only supports up to 6 players." });
			return this.setState({ alertType: "error" });
		}
		//Draw a hand of cards for new player
		const deck = this.state.deck;
		const draw = this.createHandOfCards(deck);
		const cards = draw.hand;
		const newdeck = draw.deck;
		//Update deck and selected cards list
		this.setState({deck: newdeck});
		this.addSelectedCards(cards);
		const players = this.state.players;
		//Add new player to playerlist
		const newplayer = {
			name: "",
			edit: false,
			cards: cards
		}
		players.push(newplayer);
		this.setState({players: players});
	};
	calcHighestCombo = (hand) => {
		const cards = hand.toString().replace(/,/g," ")
		if (hasRoyalFlush(cards)) { return "Royal Flush" }
		let c1 = hasStraightFlush(cards)
		if (c1) { return `Straight Flush (Highest: ${c1})` }
		let c2 = hasFourOfAKind(cards)
		if (c2) { return `Four of a Kind (Value: ${c2})` }
		let c3 = hasFullHouse(cards)
		if (c3) { return `Full House (3 of: ${c3})` }
		let c4 = hasFlush(cards)
		if (c4) { return `Flush (Suit: ${c4})` }
		let c5 = hasStraight(cards)
		if (c5) { return `Straight (Highest: ${c5})` }
		let c6 = hasThreeOfAKind(cards)
		if (c6) { return `Three of a Kind (3 of: ${c6})` }
		let c7 = hasTwoPairs(cards)
		if (c7) { return `Two Pairs (${c7[0]} and ${c7[1]})` }
		let c8 = hasPair(cards)
		if (c8) { return `One Pair (${c8})` }
		return `High Card ${highestCard(cards)}`
	}
	findWinner = () => {
		const players = this.state.players
		let winner = 0
		players[0].score = this.calcHighestCombo(players[0].cards)
		for (let i = 1; i < players.length; i++) {
			let previous = players[winner].cards.toString().replace(/,/g," ")
			let check = players[i].cards.toString().replace(/,/g," ")
			players[i].score = this.calcHighestCombo(players[i].cards)
			if (judgeWinner([previous,check]) === 1) {
				winner = i
			}
		}
		const winName = players[winner].name ? players[winner].name : `Player ${winner +1 }`
		this.setState({alert: `${winName} wins! Score: ${players[winner].score}` });
		this.setState({alertType: "win"})
	}
	closeAlert = () => {
		this.setState({alert: ""});
		this.setState({alertType: ""});
	};
	render() {
		return (
				<Layout>
				{this.state.alert && (
					<Alert type={this.state.alertType}>
						<div>{this.state.alert}
						<AlertClose onClick={this.closeAlert}>&times;</AlertClose> 
						</div>
					</Alert>
				)}
					<section>
						<h1>
						Cards deck
						</h1>
						<Deck suits={suits} values={values} 
							selectedCards={this.state.selectedCards} 
						/>
					</section>
					<section>
						<header>
							<h1>Players</h1>
						</header>
						<section>
							{this.state.players.length >= 1 && this.state.players.map((player, index) => {
									let num = index + 1
									let name = player.name ? player.name : `Player ${num} name`
									return (
										<article key={`Player${num}`}>
											<p>
												{player.edit ? <input type="text" placeholder={`Player ${num} name`} onKeyPress={(event) => this.onKeyPress(event,num)} onChange={(event) => this.onNameChange(event,num)} /> : name}
												{" "}
												<Button onClick={() => this.editName(num)}>
													<span role="img" alt="pencil" aria-label="pencil">✏️</span>
													{player.edit ? "Done" : "Edit"}
												</Button>
												<Button onClick={() => this.removePlayer(num)}>
													<span role="img" alt="flame" aria-label="flame">🔥</span>
													Remove
												</Button>
											</p>
											<PlayerHand>
													{player.cards.map(card => {
														return (
															<Card key={card} suit={card[0]} value={card[1]} selected={false}>
																{card[1]}
															</Card>
														)
													} )}
											</PlayerHand>
										</article>
										)
								})
							}	
						</section>
						<Footer>
								<Button onClick={this.addPlayer}>
									<span role="img" alt="woman raising hand" aria-label="woman raising hand">🙋‍♀️</span>
									Add new player
								</Button>
								<Button onClick={this.findWinner}>
									<span role="img" alt="trophy" aria-label="trophy">🏆</span>
									Find the winner
								</Button>
						</Footer>
					</section>

				</Layout>
		);
	}
}

export default App;
