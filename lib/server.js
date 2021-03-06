#!/usr/bin/env node

'use strict';

const request = require('request');
const prompt = require('prompt');
const auth = require('../util/get_auth');

/**
 * @class Server
 * @public
 *
 * @see {@link https://github.com/mapbox/hecate#meta|Hecate Documentation}
 */
class Server {
    /**
     * Create a new Server Instance
     *
     * @param {Hecate} api parent hecate instance
     */
    constructor(api) {
        this.api = api;
    }

    /**
     * Print help documentation about the subcommand to stderr
     */
    help() {
        console.error();
        console.error('Fetch a metadata about the server');
        console.error();
        console.error('Usage: cli.js server <subcommand>');
        console.error();
        console.error('<subcommand>:');
        console.error('    get      Get server meta');
        console.error('    stats    Get geo stats from server');
        console.error();
    }

    /**
     * Get server metadata
     *
     * @param {!Object} options Options for making a request to meta API
     *
     * @param {function} cb (err, res) style callback function
     *
     * @returns {function} (err, res) style callback
     */
    get(options = {}, cb) {
        const self = this;

        if (!options) options = {};

        if (options.script) {
            cb = cli;
            return main();
        } else if (options.cli) {
            cb = cli;

            prompt.message = '$';
            prompt.start({
                stdout: process.stderr
            });

            let args = [];

            if (self.api.auth_rules && self.api.auth_rules.server !== 'public') {
                args = args.concat(auth(self.api.user));
            }

            prompt.get(args, (err, argv) => {
                prompt.stop();

                if (argv.hecate_username) {
                    self.api.user = {
                        username: argv.hecate_username,
                        password: argv.hecate_password
                    };
                }

                return main();
            });
        } else {
            return main();
        }

        /**
         * Once the options object is populated, make the API request
         * @private
         *
         * @returns {undefined}
         */
        function main() {
            request({
                json: true,
                method: 'GET',
                url: new URL('/api', self.api.url),
                auth: self.api.user
            }, (err, res) => {
                if (err) return cb(err);
                if (res.statusCode !== 200) return cb(new Error(JSON.stringify(res.body)));

                return cb(null, res.body);
            });
        }

        /**
         * If in CLI mode, write results to stdout
         * or throw any errors incurred
         *
         * @private
         *
         * @param {Error} err [optional] API Error
         * @param {Object} server server metadata
         *
         * @returns {undefined}
         */
        function cli(err, server) {
            if (err) throw err;

            console.log(JSON.stringify(server, null, 4));
        }
    }

    /**
     * Get server stats
     *
     * @param {!Object} options Options for making a request to meta API
     *
     * @param {function} cb (err, res) style callback function
     *
     * @returns {function} (err, res) style callback
     */
    stats(options = {}, cb) {
        const self = this;

        if (!options) options = {};

        if (options.script) {
            cb = cli;
            return main();
        } else if (options.cli) {
            cb = cli;

            prompt.message = '$';
            prompt.start({
                stdout: process.stderr
            });

            let args = [];

            if (!self.api.user && self.api.auth_rules && self.api.auth_rules.stats.get !== 'public') {
                args = args.concat(auth(self.api.user));
            }

            prompt.get(args, (err, argv) => {
                prompt.stop();

                if (argv.hecate_username) {
                    self.api.user = {
                        username: argv.hecate_username,
                        password: argv.hecate_password
                    };
                }

                return main();
            });
        } else {
            return main();
        }

        /**
         * Once the options object is populated, make the API request
         * @private
         *
         * @returns {undefined}
         */
        function main() {
            request({
                json: true,
                method: 'GET',
                url: new URL('/api/data/stats', self.api.url),
                auth: self.api.user
            }, (err, res) => {
                if (err) return cb(err);
                if (res.statusCode !== 200) return cb(new Error(JSON.stringify(res.body)));

                return cb(null, res.body);
            });
        }

        /**
         * If in CLI mode, write results to stdout
         * or throw any errors incurred
         *
         * @private
         *
         * @param {Error} err [optional] API Error
         * @param {Object} stats Server data stats
         *
         * @returns {undefined}
         */
        function cli(err, stats) {
            if (err) throw err;

            console.log(JSON.stringify(stats, null, 4));
        }
    }
}

module.exports = Server;
