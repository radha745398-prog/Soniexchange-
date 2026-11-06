const { doc, getDoc, setDoc, updateDoc } = require('firebase/firestore');

async function handleDeposit(req, res, db) {
    const { loggedInUser, clientUsername, amount, txnPassword } = req.body;
    const depositAmount = Number(amount);

    if (isNaN(depositAmount) || depositAmount <= 0 || !clientUsername) {
        return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }

    try {
        const adminRef = doc(db, 'users', loggedInUser || 'Soniexchange');
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) return res.redirect('/');
        const adminData = adminSnap.data();

        if (adminData.txnPassword && adminData.txnPassword !== txnPassword) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        const clientRef = doc(db, 'users', clientUsername.trim());
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }
        const clientData = clientSnap.data();

        await updateDoc(clientRef, { points: Number(clientData.points || 0) + depositAmount });
        await updateDoc(adminRef, { points: Number(adminData.points || 0) - depositAmount });

        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        console.error("Deposit Error:", err);
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

async function handleWithdraw(req, res, db) {
    const { loggedInUser, clientUsername, amount, txnPassword } = req.body;
    const withdrawAmount = Number(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0 || !clientUsername) {
        return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }

    try {
        const adminRef = doc(db, 'users', loggedInUser || 'Soniexchange');
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) return res.redirect('/');
        const adminData = adminSnap.data();

        if (adminData.txnPassword && adminData.txnPassword !== txnPassword) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        const clientRef = doc(db, 'users', clientUsername.trim());
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }
        const clientData = clientSnap.data();

        await updateDoc(clientRef, { points: Number(clientData.points || 0) - withdrawAmount });
        await updateDoc(adminRef, { points: Number(adminData.points || 0) + withdrawAmount });

        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        console.error("Withdraw Error:", err);
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

async function handleExposureLimit(req, res, db) {
    const { loggedInUser, clientUsername, newLimit, txnPassword } = req.body;
    const limitAmount = Number(newLimit);

    if (isNaN(limitAmount) || limitAmount < 0 || !clientUsername) {
        return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }

    try {
        const adminRef = doc(db, 'users', loggedInUser || 'Soniexchange');
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) return res.redirect('/');
        const adminData = adminSnap.data();

        if (adminData.txnPassword && adminData.txnPassword !== txnPassword) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        const clientRef = doc(db, 'users', clientUsername.trim());
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        await updateDoc(clientRef, { exposureLimit: limitAmount });
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        console.error("Exposure Limit Error:", err);
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

async function handleCreditRef(req, res, db) {
    const { loggedInUser, clientUsername, newCredit, txnPassword } = req.body;
    const creditAmount = Number(newCredit);

    if (isNaN(creditAmount) || creditAmount < 0 || !clientUsername) {
        return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }

    try {
        const adminRef = doc(db, 'users', loggedInUser || 'Soniexchange');
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) return res.redirect('/');
        const adminData = adminSnap.data();

        if (adminData.txnPassword && adminData.txnPassword !== txnPassword) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        const clientRef = doc(db, 'users', clientUsername.trim());
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        await updateDoc(clientRef, { creditRef: creditAmount });
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        console.error("Credit Reference Error:", err);
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

async function handlePasswordChange(req, res, db) {
    const { loggedInUser, clientUsername, newPassword, confirmPassword, txnPassword } = req.body;

    if (!clientUsername || !newPassword || newPassword !== confirmPassword) {
        return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }

    try {
        const adminRef = doc(db, 'users', loggedInUser || 'Soniexchange');
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) return res.redirect('/');
        const adminData = adminSnap.data();

        if (adminData.txnPassword && adminData.txnPassword !== txnPassword) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        const clientRef = doc(db, 'users', clientUsername.trim());
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        await updateDoc(clientRef, { password: newPassword });
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        console.error("Password Change Error:", err);
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

async function handleStatusChange(req, res, db) {
    const { loggedInUser, clientUsername, userActive, betActive, txnPassword } = req.body;

    if (!clientUsername) {
        return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }

    try {
        const adminRef = doc(db, 'users', loggedInUser || 'Soniexchange');
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) return res.redirect('/');
        const adminData = adminSnap.data();

        if (adminData.txnPassword && adminData.txnPassword !== txnPassword) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        const clientRef = doc(db, 'users', clientUsername.trim());
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        await updateDoc(clientRef, {
            userActive: userActive === 'true',
            betActive: betActive === 'true'
        });

        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch (err) {
        console.error("Change Status Error:", err);
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser || 'Soniexchange')}`);
    }
}

async function handleUpdateAdminBalance(req, res, db) {
    const { loggedInUser, newBalance, txnPassword } = req.body;
    const amount = Number(newBalance);

    if (isNaN(amount) || amount < 0 || loggedInUser !== 'Soniexchange') {
        return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    }

    try {
        const userRef = doc(db, 'users', 'Soniexchange');
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) return res.redirect('/');
        const user = docSnap.data();

        if (user.txnPassword && user.txnPassword !== txnPassword) {
            return res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
        }

        await updateDoc(userRef, {
            points: amount,
            creditRef: amount
        });

        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    } catch(err) {
        console.error(err);
        res.redirect(`/soni-view?username=${encodeURIComponent(loggedInUser)}`);
    }
}

async function handleCreateClient(req, res, db) {
    const { createdBy, clientName, password, creditRef, accountType, txnPassword } = req.body;
    
    if (!clientName || !password) {
        return res.redirect('/soni-view?username=' + encodeURIComponent(createdBy || 'Soniexchange'));
    }

    try {
        const userRef = doc(db, 'users', clientName.trim());
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            return res.redirect('/soni-view?username=' + encodeURIComponent(createdBy || 'Soniexchange'));
        }

        await setDoc(userRef, {
            username: clientName.trim(),
            password: password,
            creditRef: Number(creditRef || 0),
            points: Number(creditRef || 0),
            exposure: 0,
            exposureLimit: Number(creditRef || 0),
            role: accountType || 'Client',
            createdBy: createdBy || 'Soniexchange',
            userActive: true,
            betActive: true,
            defaultPct: 0,
            txnPassword: txnPassword || '',
            mustChangePassword: true,
            createdAt: new Date().toISOString()
        });

        res.redirect('/soni-view?username=' + encodeURIComponent(createdBy || 'Soniexchange'));
    } catch(err) {
        console.error(err);
        res.redirect('/soni-view?username=' + encodeURIComponent(createdBy || 'Soniexchange'));
    }
}

module.exports = {
    handleDeposit,
    handleWithdraw,
    handleExposureLimit,
    handleCreditRef,
    handlePasswordChange,
    handleStatusChange,
    handleUpdateAdminBalance,
    handleCreateClient
};
