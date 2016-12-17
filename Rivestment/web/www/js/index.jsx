"use strict";

const updateInterval = 10000;
const maxUpdates = 25;
const socket = io();
const scoreHistory = [];

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

const writeScores = function() {
    $.getJSON("profiles.json", function(profiles) {
        ReactDOM.render(
            <ScoreboardTable rows={rowsFromProfiles(profiles)}/>,
            document.getElementById("score-table")
        );
        let graphicData = [];
        let players = [];
        const now = new Date(Date.now());
        profiles.forEach(function(profile){
            if(!scoreHistory[profile.name]) {
                scoreHistory[profile.name] = []
            }
            scoreHistory[profile.name].push({'date': now, 'value': profile.score});
            const elementsToTrim = Math.max(0, scoreHistory[profile.name].length - maxUpdates);
            scoreHistory[profile.name].splice(0, elementsToTrim);
            players.push(profile.name);
            graphicData.push(scoreHistory[profile.name]);
        });
        const boundingBox = document.querySelector('#scores').getBoundingClientRect();
        const width = boundingBox.right - boundingBox.left;
        MG.data_graphic({
            data: graphicData,
            width: width,
            height: width * 0.45,
            missing_is_hidden: false,
            animate_on_load: false,
            target: '#scores',
            legend: players,
            y_scale_type: 'log',
            legend_target: '#legend'
        });
    });
};

ReactDOM.render(
    <UpdatesTable/>,
document.getElementById("updates-table")
);


$( document ).ready(function() {
    writeScores();
    setInterval(writeScores, updateInterval);
});