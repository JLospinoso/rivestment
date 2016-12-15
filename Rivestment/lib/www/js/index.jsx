"use strict";

const maxUpdates = 25;
const socket = io();

const rowsFromProfiles = function(profiles) {
    const scoreboardRows = [];
    profiles.forEach(function(profile){
        scoreboardRows.push({
            bot: profile.name,
            score: profile.score,
            password: profile.password,
            level: profile.level,
            scraps: profile.challenges.hash.length
        });
    });
    return scoreboardRows;
};

const ScoreboardRow = React.createClass({
    render: function () {
        return (<tr>
            <td>{this.props.row.bot}</td>
            <td>{this.props.row.score}</td>
            <td>{this.props.row.password}</td>
            <td>{this.props.row.level}</td>
            <td>{this.props.row.scraps}</td>
        </tr>)
    }
});

class ScoreboardTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {rows: props.rows};
        this.updateRows = this.updateRows.bind(this);
        const x = this.updateRows;
        socket.on('updateScoreboard', function(profiles){
            const scoreboardRows = rowsFromProfiles(profiles);
            x(scoreboardRows);
        });
    }

    updateRows(newRows) {
        this.setState(prevState =>({
            rows: newRows
        }));
    }

    render() {
        const rows = [];
        this.state.rows.forEach(function(row){
            rows.push(<ScoreboardRow key={"scoreboardRow" + row.bot} row={row}/>);
        });
        return (
            <table className="table">
                <thead>
                <tr>
                    <th>Bot</th>
                    <th>Score</th>
                    <th>Password</th>
                    <th>Level</th>
                    <th>Scraps</th>
                </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    }
}

class UpdatesTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = { rows: [] };
        this.prependUpdate = this.prependUpdate.bind(this);
        const closure = this.prependUpdate;
        socket.on('update', function(update){
            console.log("[ ] Got an update: " + JSON.stringify(update));
            closure(update);
        });
    }

    prependUpdate(newUpdate) {
        this.setState(prevState =>({
            rows: [newUpdate].concat(prevState.rows).slice(0, maxUpdates-1)
        }));
    }

    render() {
        const rows = [];
        this.state.rows.forEach(function(update){
            rows.push(<tr><td>{update.type}</td><td>{update.user}</td><td>{update.text}</td></tr>);
        });
        return (
            <table className="table">
                <thead>
                <tr>
                    <th>Type</th>
                    <th>User</th>
                    <th>Update</th>
                </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    }
}

$.getJSON("profiles.json", function(profiles) {
    ReactDOM.render(
        <ScoreboardTable rows={rowsFromProfiles(profiles)}/>,
        document.getElementById("score-table")
    );

});

ReactDOM.render(
    <UpdatesTable/>,
document.getElementById("updates-table")
);

