const express = require('express');
const GameController = require('../api/controllers/GameController');
const router = express.Router();

router.get('/game/:game_code', (req, resp) => {
    return GameController.show(req, resp);
});

module.exports = router;