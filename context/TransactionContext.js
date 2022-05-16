import React,{useState,useEffect} from "react"
import {contractABI,contractAddress} from '../lib/constant'
import { ethers } from "ethers";
import {client} from '../lib/sanityClient'
export const TransactionContext = React.createContext();
import {useRouter} from 'next/router'
let eth;
if(typeof window != "undefined"){
    eth = window.ethereum;
}
const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(eth);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
    );
    return transactionContract;
}
const powered = "An original GhosT Project";
export const TransactionProvider = ({children}) => {
    //Mes states
    const [currentAccount,setCurrentAccount] = useState('');
    const [isLoading,setIsLoading] = useState(false);
    const [formData,setFormData] = useState({
        addressTo : '',
        amount : ''
    });
    /* 1:1:12 */
    
    //Mes states End
    //state de chargement
    //useRouter
    const router = useRouter();

    useEffect(()=>{
        checkIfWalletIsConnected();
        window.ethereum.on('accountsChanged',() => {
            checkIfWalletIsConnected();
        })
    },[])
    useEffect(()=>{
        if(!currentAccount) return ;
        (async() => {
            const userDoc = {
                _id : currentAccount,
                _type : 'users',
                username : 'unamed',
                address : currentAccount 
            }
            client.createIfNotExists(userDoc); 
        })()
    },[currentAccount])
    
    //state de chargement - end

    const connectWallet = async(metamask = eth) => {
        try{
            if(!metamask) alert('Please Install Metamask');
            const accounts = await metamask.request({method : 'eth_requestAccounts'});
            setCurrentAccount(accounts[0]);
        }catch(error){
            console.error(error);
            throw new Error('No ethereum object !');
        }  
    }
    const checkIfWalletIsConnected = async(metamask = eth) => {
        try{
            if(!metamask) alert('Please Install Metamask');
            const account = await metamask.request({method : 'eth_accounts'})
            if(account.length){
                setCurrentAccount(account[0]);
                console.log("Your Wallert is already connected !")
            }
        }catch(error){
            console.error(error)
            throw new Error('No ethereum object !');
        }
    }
    const sendTransaction = async(
        metamask = eth,
        connectedAccount = currentAccount
        ) =>{

            try{

                if(!metamask) alert('Please install metamask .');
                const {addressTo,amount} = formData;
                const  transactionContract = getEthereumContract();
                const parsedAmount = ethers.utils.parseEther(amount)
                await metamask.request({method : 'eth_sendTransaction',
                    params:[
                    {
                        from : connectedAccount,
                        to : addressTo,
                        gas : '0x7EF40',
                        value : parsedAmount._hex
                    }
                ]});
                const transactionHash = await transactionContract.publishTransaction(
                    addressTo,
                    parsedAmount,
                    `Transfering ETH ${parsedAmount} to ${addressTo}`,
                    'TRANSFER'
                )
                setIsLoading(true);
                await transactionHash.wait();
                await saveTransaction(
                    transactionHash.hash,
                    amount,
                    connectedAccount,
                    addressTo,
                )
                setIsLoading(false);
            }catch(error){
                console.error(error);
                throw new Error("No Ethereum Object for transaction .");
            }
    }
    const handleChange = (e,name) => {
        setFormData((prevState)=> ({...prevState,[name] : e.target.value}))
    }
    const saveTransaction = async(
        txHash,
        amount,
        fromAddress,
        toAddress
    ) =>{
        const txDoc = {
            _type : 'transactions',
            _id : txHash,
            fromAddress : fromAddress,
            toAddress : toAddress,
            amount :  parseFloat(amount),
            timestamp : new Date(Date.now()).toISOString(),
            txHash : txHash
        }
        //ajouter au document : transactionss -> _type
        await client.createIfNotExists(txDoc);
        //lier avec le user
        await client.patch(currentAccount)
                    .setIfMissing({transactions : []})
                    .insert('after','transactions[-1]',[
                        {
                        _key : txHash,
                        _ref : txHash,
                        _type : 'reference'
                    }
                ]).commit()

    }
    //for modal
    useEffect(()=>{
        if(isLoading){
            router.push(`/?loading=${currentAccount}`);
        }else{
            router.push('/');
        }
    },[isLoading])
    return(
        <TransactionContext.Provider value={{
            currentAccount,
            connectWallet,
            powered,
            sendTransaction,
            handleChange,
            formData,
            isLoading
        }}>
            {children}
        </TransactionContext.Provider>
    )
}
