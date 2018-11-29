import React from 'react';
import { Card, PlayerHand } from "../Styles/Styled";

const PlayerHandSection = ({ cards }) => {
	return (
		<PlayerHand>
			{cards.map(card => {
				return (
					<Card key={card} suit={card[0]} value={card[1]} selected={false}>
						{card[1]}
					</Card>
				)
			} )}
		</PlayerHand>
	)
}

export default PlayerHandSection;