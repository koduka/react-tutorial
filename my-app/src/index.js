import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
    return (
        <button className="square" style={props.isHighlight ? { background: "#FFFF00" } : null} onClick={() => props.onClick()}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(x, y, isHighlight) {
        return <Square key={`${x}${y}`} isHighlight={isHighlight} value={this.props.squares[y][x]} onClick={() => this.props.onClick(x, y)} />;
    }
    isHighlight(x, y) {
        if (this.props.highlightLine) {
            for (const highlightPoint of this.props.highlightLine) {
                const [pointX, pointY] = highlightPoint;
                if (pointX === x && pointY === y) {
                    return true
                }
            }
        }
        return false
    }
    render() {
        return (
            <div>
                {
                    this.props.squares.map((squares, y) => {
                        return (
                            <div key={y} className="board-row">
                                {
                                    squares.map((square, x) => this.renderSquare(x, y, this.isHighlight(x, y)))
                                }
                            </div>
                        )
                    })
                }
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                point: {
                    x: null,
                    y: null
                },
                squares: Array.from(new Array(props.bordSize), () => new Array(props.bordSize).fill(null)),
            }],
            bordSize: props.bordSize,
            stepNumber: 0,
            xIsNext: true,
            isReverse: false,
        };
    }
    handleClick(x, y) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = copySqueres(current.squares);
        if (calculateWinner(squares) || squares[y][x]) {
            return;
        }
        squares[y][x] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                point: {
                    x,
                    y,
                },
                squares: squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const moves = history.map((step, move) => {
            const desc = move ? `Go to move (${step.point.x}, ${step.point.y}) #${move}` : 'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                        {
                            this.state.stepNumber === move ? <b>{desc}</b> : desc
                        }
                    </button>
                </li>
            );
        });
        let status;
        let highlightLine;
        if (winner) {
            status = 'Winner: ' + winner[0];
            highlightLine = winner[1]
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board highlightLine={highlightLine} squares={current.squares} onClick={(x, y) => this.handleClick(x, y)} />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={() => {
                        this.setState({
                            isReverse: !this.state.isReverse
                        })
                    }}>
                        {
                            this.state.isReverse ? '降順にする' : '昇順にする'
                        }
                    </button>
                    <ol>{this.state.isReverse ? moves : moves.reverse()}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a[1]][a[0]] && squares[a[1]][a[0]] === squares[b[1]][b[0]] && squares[a[1]][a[0]] === squares[c[1]][c[0]]) {
            return [squares[a[1]][a[0]], [a, b, c]];
        }
    }
    return null;
}

function copySqueres(origin) {
    const copy = [];
    for (const line of origin) {
        copy.push([...line]);
    }
    return copy;
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game bordSize={3} />);
