use soroban_sdk::contracttype;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]  
pub enum Outcome {
    Home,
    Draw,
    Away,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PoolType {
    WinnerTakeAll,
    Split,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PoolStatus {
    Open,
    Closed,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Participant {
    pub address: Address,
    pub pick: Outcome,
    pub joined_at: u64,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Payout {
    pub address: Address,
    pub amount: i128,
    pub refund: bool,
}

#[contracttype]
#[derive(Clone, Debug)]  
pub struct Pool {
    pub id: u64,
    pub match_id: u64,
    pub creator: Address,
    pub token: Address,
    pub entry_amount: i128,
    pub pool_type: PoolType,
    pub status: PoolStatus,
    pub participants: Vec<Participant>,
    pub result: Option<Outcome>,
    pub payouts: Vec<Payout>,
    pub created_at: u64,
    pub settled_at: Option<u64>,
}

#[contracttype]
pub enum DataKey{
    Admin,
    Pool(Symbol),
}
