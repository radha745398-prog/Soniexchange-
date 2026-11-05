const { doc, getDoc, updateDoc } = require('firebase/firestore');

async function handleDeposit(req, res, db) {
    const { loggedInUser, clientUsername, amount, txnPassword } = req.body;
    const depositAmount = Number(amount);
    if (isNaN(depositAmount) || depositAmount <= 0 || !clientUsername) return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);

    try {
        const adminSnap = await getDoc(doc(db, 'users', loggedInUser || 'Soniexchange'));
        if (!adminSnap.exists() || (adminSnap.data().txnPassword && adminSnap.data().txnPassword !== txnPassword)) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }
        const clientRef = doc(db, 'users', clientUsername.trim());
        const clientSnap = await getDoc(clientRef);
        if (!clientSnap.exists()) return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);

        await updateDoc(clientRef, { points: Number(clientSnap.data().points || 0) + depositAmount });
        await updateDoc(doc(db, 'users', loggedInUser), { points: Number(adminSnap.data().points || 0) - depositAmount });
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

async function handleWithdraw(req, res, db) {
    const { loggedInUser, clientUsername, amount, txnPassword } = req.body;
    const withdrawAmount = Number(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0 || !clientUsername) return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);

    try {
        const adminSnap = await getDoc(doc(db, 'users', loggedInUser || 'Soniexchange'));
        if (!adminSnap.exists() || (adminSnap.data().txnPassword && adminSnap.data().txnPassword !== txnPassword)) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }
        const clientRef = doc(db, 'users', clientUsername.trim());
        const clientSnap = await getDoc(clientRef);
        if (!clientSnap.exists()) return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);

        await updateDoc(clientRef, { points: Number(clientSnap.data().points || 0) - withdrawAmount });
        await updateDoc(doc(db, 'users', loggedInUser), { points: Number(adminSnap.data().points || 0) + withdrawAmount });
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

async function handleExposureLimit(req, res, db) {
    const { loggedInUser, clientUsername, newLimit, txnPassword } = req.body;
    const limitAmount = Number(newLimit);
    if (isNaN(limitAmount) || limitAmount < 0 || !clientUsername) return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);

    try {
        const adminSnap = await getDoc(doc(db, 'users', loggedInUser || 'Soniexchange'));
        if (!adminSnap.exists() || (adminSnap.data().txnPassword && adminSnap.data().txnPassword !== txnPassword)) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }
        await updateDoc(doc(db, 'users', clientUsername.trim()), { exposureLimit: limitAmount });
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

async function handleCreditRef(req, res, db) {
    const { loggedInUser, clientUsername, newCredit, txnPassword } = req.body;
    const creditAmount = Number(newCredit);
    if (isNaN(creditAmount) || creditAmount < 0 || !clientUsername) return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);

    try {
        const adminSnap = await getDoc(doc(db, 'users', loggedInUser || 'Soniexchange'));
        if (!adminSnap.exists() || (adminSnap.data().txnPassword && adminSnap.data().txnPassword !== txnPassword)) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }
        await updateDoc(doc(db, 'users', clientUsername.trim()), { creditRef: creditAmount });
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

async function handlePasswordChange(req, res, db) {
    const { loggedInUser, clientUsername, newPassword, confirmPassword, txnPassword } = req.body;
    if (!clientUsername || !newPassword || newPassword !== confirmPassword) return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);

    try {
        const adminSnap = await getDoc(doc(db, 'users', loggedInUser || 'Soniexchange'));
        if (!adminSnap.exists() || (adminSnap.data().txnPassword && adminSnap.data().txnPassword !== txnPassword)) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }
        await updateDoc(doc(db, 'users', clientUsername.trim()), { password: newPassword });
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

async function handleStatusChange(req, res, db) {
    const { loggedInUser, clientUsername, userActive, betActive, txnPassword } = req.body;
    if (!clientUsername) return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);

    try {
        const adminSnap = await getDoc(doc(db, 'users', loggedInUser || 'Soniexchange'));
        if (!adminSnap.exists() || (adminSnap.data().txnPassword && adminSnap.data().txnPassword !== txnPassword)) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }
        await updateDoc(doc(db, 'users', clientUsername.trim()), {
            userActive: userActive === 'true',
            betActive: betActive === 'true'
        });
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

module.exports = {
    handleDeposit,
    handleWithdraw,
    handleExposureLimit,
    handleCreditRef,
    handlePasswordChange,
    handleStatusChange
};
