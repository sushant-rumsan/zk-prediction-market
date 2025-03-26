import credits.aleo;

program sushant_zk_prediction_market.aleo {
    // Structs
    struct PredictionStake {
        account: address,
        token_id: field,
        event_id: field,
    }

    struct Event {
        outcome: bool,
        resolved: bool,
        total_yes_stake: u64,
        total_no_stake: u64,
    }

    // Mappings
    mapping admin: bool => address;
    mapping status: bool => u8;
    mapping stake_limit: bool => u64;
    mapping user_stake: field => u64;
    mapping stake_time: field => u32;
    mapping events: field => Event;
    mapping decay_factor: bool => u32;

    // Constants
    const UNPAUSED_STATUS: u8 = 1u8;
    const PAUSED_STATUS: u8 = 0u8;
    const NATIVE_TOKEN: field = 11111111111111111111field;
    const DECAY_INTERVAL: u32 = 100u32;

    // Initialize the contract
    async transition initialize(owner: address, limit: u64) -> Future {
        assert(limit > 0u64);
        return finalize_initialize(owner, limit);
    }

    async function finalize_initialize(owner: address, limit: u64) {
        assert(!admin.contains(true));
        admin.set(true, owner);
        stake_limit.set(true, limit);
        status.set(true, PAUSED_STATUS);
        decay_factor.set(true, DECAY_INTERVAL);
    }

    // Create a new event (admin only)
    async transition create_event(event_id: field) -> Future {
        return finalize_create_event(self.caller, event_id);
    }

    async function finalize_create_event(from: address, event_id: field) {
        let owner: address = admin.get(true);
        assert_eq(from, owner);
        assert(!events.contains(event_id));
        events.set(event_id, Event { outcome: false, resolved: false, total_yes_stake: 0u64, total_no_stake: 0u64 });
    }

    // Stake on a prediction event
    async transition stake_public(event_id: field, amount: u64, prediction: bool) -> Future {
        assert(amount > 0u64);
        let transfer_output: Future = credits.aleo/transfer_public_as_signer(self.address, amount);
        return finalize_stake_public(self.caller, event_id, amount, prediction, NATIVE_TOKEN, transfer_output);
    }

    async function finalize_stake_public(user: address, event_id: field, amount: u64, prediction: bool, token_id: field, f: Future) {
        f.await();
        assert_eq(status.get(true), UNPAUSED_STATUS);
        assert(amount <= stake_limit.get(true));
        assert(events.contains(event_id));
        let event: Event = events.get(event_id);
        assert(!event.resolved);
        let stake_record: PredictionStake = PredictionStake {
            account: user,
            token_id: token_id,
            event_id: event_id
        };
        let stake_key: field = BHP256::hash_to_field(stake_record);
        let current_stake: u64 = user_stake.get_or_use(stake_key, 0u64);
        user_stake.set(stake_key, current_stake + amount);
        stake_time.set(stake_key, block.height);
        let new_yes_stake: u64 = prediction ? event.total_yes_stake + amount : event.total_yes_stake;
        let new_no_stake: u64 = prediction ? event.total_no_stake : event.total_no_stake + amount;
        events.set(event_id, Event {
            outcome: event.outcome,
            resolved: event.resolved,
            total_yes_stake: new_yes_stake,
            total_no_stake: new_no_stake
        });
    }

    // Resolve an event (admin only)
    async transition resolve_event(event_id: field, outcome: bool) -> Future {
        return finalize_resolve_event(self.caller, event_id, outcome);
    }

    async function finalize_resolve_event(from: address, event_id: field, outcome: bool) {
        let owner: address = admin.get(true);
        assert_eq(from, owner);
        assert_eq(status.get(true), UNPAUSED_STATUS);
        assert(events.contains(event_id));
        let event: Event = events.get(event_id);
        assert(!event.resolved);
        events.set(event_id, Event {
            outcome: outcome,
            resolved: true,
            total_yes_stake: event.total_yes_stake,
            total_no_stake: event.total_no_stake
        });
    }

    // Claim winnings
    async transition claim_public(event_id: field, amount: u64) -> Future {
        assert(amount > 0u64);
        let transfer_output: Future = credits.aleo/transfer_public(self.caller, amount);
        return finalize_claim_public(self.caller, event_id, amount, NATIVE_TOKEN, transfer_output);
    }

    async function finalize_claim_public(user: address, event_id: field, amount: u64, token_id: field, f: Future) {
        f.await();
        assert_eq(status.get(true), UNPAUSED_STATUS);
        assert(events.contains(event_id));
        let event: Event = events.get(event_id);
        assert(event.resolved);
        let stake_record: PredictionStake = PredictionStake {
            account: user,
            token_id: token_id,
            event_id: event_id
        };
        let stake_key: field = BHP256::hash_to_field(stake_record);
        let user_stake_amount: u64 = user_stake.get_or_use(stake_key, 0u64);
        assert(user_stake_amount > 0u64);
        let stake_block: u32 = stake_time.get_or_use(stake_key, 0u32);
        let blocks_elapsed: u32 = block.height - stake_block;
        let decay_periods: u32 = blocks_elapsed / DECAY_INTERVAL;
        let decayed_stake: u64 = user_stake_amount >> decay_periods;
        let total_winning_stake: u64 = event.outcome ? event.total_yes_stake : event.total_no_stake;
        let total_losing_stake: u64 = event.outcome ? event.total_no_stake : event.total_yes_stake;
        let predicted_yes: bool = decayed_stake <= event.total_yes_stake;
        assert(predicted_yes == event.outcome);
        let payout: u64 = decayed_stake * (total_losing_stake + total_winning_stake) / total_winning_stake;
        assert(amount <= payout);
        user_stake.set(stake_key, user_stake_amount - decayed_stake);
    }

    // Admin controls
    async transition unpause() -> Future {
        return finalize_unpause(self.caller);
    }

    async function finalize_unpause(from: address) {
        let owner: address = admin.get(true);
        assert_eq(from, owner);
        status.set(true, UNPAUSED_STATUS);
    }

    async transition pause() -> Future {
        return finalize_pause(self.caller);
    }

    async function finalize_pause(from: address) {
        let owner: address = admin.get(true);
        assert_eq(from, owner);
        status.set(true, PAUSED_STATUS);
    }

    async transition change_limit(new_limit: u64) -> Future {
        return finalize_change_limit(self.caller, new_limit);
    }

    async function finalize_change_limit(from: address, new_limit: u64) {
        let owner: address = admin.get(true);
        assert_eq(from, owner);
        assert(new_limit > 0u64);
        stake_limit.set(true, new_limit);
    }

    async transition withdraw(amount: u64) -> Future {
        let transfer_output: Future = credits.aleo/transfer_public(self.caller, amount);
        return finalize_withdraw(amount, self.caller, transfer_output);
    }

    async function finalize_withdraw(amount: u64, from: address, f: Future) {
        f.await();
        let owner: address = admin.get(true);
        assert_eq(from, owner);
    }
}